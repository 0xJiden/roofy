import { createServerFn } from "@tanstack/react-start";

import { IDS, SERVICES, type ServiceSlug } from "#/lib/site";
import { currentVisitor } from "#/lib/session.server";
import { whopGet, whopPost } from "#/lib/whop.server";

/* -------------------------------------------------------------------------- */
/* Session                                                                     */
/* -------------------------------------------------------------------------- */

export const getVisitor = createServerFn({ method: "GET" }).handler(async () => {
	const visitor = await currentVisitor();
	return visitor ? { id: visitor.id, name: visitor.name ?? null, email: visitor.email ?? null } : null;
});

/* -------------------------------------------------------------------------- */
/* Request an Estimate -> Whop Leads API                                       */
/* -------------------------------------------------------------------------- */

export type EstimateInput = {
	service: ServiceSlug;
	name: string;
	phone: string;
	email: string;
	address: string;
	zip: string;
	timeline: string;
	details: string;
	referrer?: string;
};

const clip = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export const submitEstimate = createServerFn({ method: "POST" })
	.inputValidator((input: EstimateInput) => input)
	.handler(async ({ data }): Promise<{ ok: true; leadId: string | null } | { ok: false; reason: "signed_out" | "invalid" | "failed"; message?: string }> => {
		// The Leads API records a lead against a Whop user, so the visitor signs in first.
		const visitor = await currentVisitor();
		if (!visitor) return { ok: false, reason: "signed_out" };

		const service = SERVICES.find((s) => s.slug === data.service);
		const name = clip(data.name, 120);
		const phone = clip(data.phone, 40);
		const address = clip(data.address, 200);
		const zip = clip(data.zip, 12);
		if (!service || !name || !phone || !address || !/^\d{5}(-\d{4})?$/.test(zip)) {
			return { ok: false, reason: "invalid", message: "Please fill in name, phone, address and a 5-digit ZIP." };
		}

		try {
			const lead = await whopPost<{ id?: string }>("/leads", {
				account_id: IDS.account,
				product_id: service.productId,
				user_id: visitor.id,
				referrer: clip(data.referrer, 500) || undefined,
				metadata: {
					source: "estimate_form",
					service: service.slug,
					name,
					phone,
					email: clip(data.email, 200) || visitor.email || "",
					address,
					zip,
					timeline: clip(data.timeline, 60),
					details: clip(data.details, 1500),
				},
			});
			return { ok: true, leadId: lead.id ?? null };
		} catch (error) {
			console.error("[estimate] lead failed", error instanceof Error ? error.message : error);
			return { ok: false, reason: "failed", message: "We could not save your request. Please call us instead." };
		}
	});

/* -------------------------------------------------------------------------- */
/* Deposit: save the card with a setup intent, then charge the $500 deposit    */
/* -------------------------------------------------------------------------- */

type SetupIntent = {
	id?: string;
	status?: string;
	client_secret?: string;
	payment_method_id?: string | null;
	payment_method?: { id?: string } | null;
	member_id?: string | null;
	member?: { id?: string } | null;
	metadata?: Record<string, string> | null;
	next_action?: unknown;
};

export const startCardOnFile = createServerFn({ method: "POST" })
	.inputValidator((input: { confirmationToken: string; email: string; returnUrl: string; estimateRef?: string }) => input)
	.handler(async ({ data }): Promise<{ id: string; clientSecret: string; status: string }> => {
		const intent = await whopPost<SetupIntent>("/setup_intents", {
			account_id: IDS.account,
			confirmation_token: data.confirmationToken,
			email: data.email,
			currency: "usd",
			return_url: data.returnUrl,
			metadata: { purpose: "project_deposit", estimate_ref: clip(data.estimateRef, 80) },
		});
		if (!intent.id || !intent.client_secret) throw new Error("Could not start saving your card.");
		return { id: intent.id, clientSecret: intent.client_secret, status: intent.status ?? "processing" };
	});

export const setupStatus = createServerFn({ method: "GET" })
	.inputValidator((id: string) => id)
	.handler(async ({ data: id }): Promise<{ status: string; message?: string }> => {
		const body = await whopGet<{ status?: string; last_error?: { message?: string } | null }>(`/setup_intents/${id}/status`);
		return { status: body.status ?? "processing", message: body.last_error?.message ?? undefined };
	});

async function memberIdFor(intent: SetupIntent, email?: string): Promise<string | null> {
	const direct = intent.member_id ?? intent.member?.id;
	if (direct) return direct;
	if (!email) return null;
	const query = new URLSearchParams({ account_id: IDS.account, query: email, first: "5" });
	const list = await whopGet<{ data?: { id?: string; user?: { email?: string } }[] }>(`/members?${query}`);
	return list.data?.[0]?.id ?? null;
}

/** Charges the $500 deposit to the card just saved. Safe to retry: one idempotency key per setup. */
export const chargeDeposit = createServerFn({ method: "POST" })
	.inputValidator((input: { setupIntentId: string; email: string; returnUrl: string }) => input)
	.handler(async ({ data }): Promise<{ paymentId: string | null; status: string; paymentMethodId: string; clientSecret: string | null }> => {
		const intent = await whopGet<SetupIntent>(`/setup_intents/${data.setupIntentId}`);
		if (intent.status !== "succeeded") throw new Error("Your card has not been saved yet.");
		if (intent.metadata?.purpose !== "project_deposit") throw new Error("This card was not saved for a deposit.");
		const paymentMethodId = intent.payment_method_id ?? intent.payment_method?.id;
		const memberId = await memberIdFor(intent, data.email);
		if (!paymentMethodId || !memberId) throw new Error("We could not find the saved card. Please try again.");

		const payment = await whopPost<{ id?: string; status?: string }>(
			"/payments",
			{
				account_id: IDS.account,
				plan_id: IDS.deposit.plan,
				member_id: memberId,
				payment_method_id: paymentMethodId,
				off_session: false,
				return_url: data.returnUrl,
				metadata: { kind: "project_deposit", setup_intent: data.setupIntentId, estimate_ref: intent.metadata?.estimate_ref ?? "" },
			},
			`deposit-${data.setupIntentId}`,
		);
		// An issuer can still ask the buyer to authenticate; the client finishes that step.
		let clientSecret: string | null = null;
		if (payment.id && payment.status !== "paid") {
			const state = await whopGet<{ next_action?: { client_secret?: string } | null }>(`/payments/${payment.id}/status`).catch(() => null);
			clientSecret = state?.next_action?.client_secret ?? null;
		}
		return { paymentId: payment.id ?? null, status: payment.status ?? "processing", paymentMethodId, clientSecret };
	});
