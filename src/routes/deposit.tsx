import { Link, createFileRoute } from "@tanstack/react-router";
import { loadWhop } from "@whop/elements";
import {
	AddressElement,
	BrandingElement,
	EmailElement,
	PaymentElement,
	Payments,
	WhopElements,
	usePayments,
	useWhop,
} from "@whop/elements-react";
import { Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { chargeDeposit, setupStatus, startCardOnFile } from "#/lib/server-fns";
import { IDS, SITE, money } from "#/lib/site";
import { track } from "#/lib/track";

export const Route = createFileRoute("/deposit")({
	validateSearch: (search: Record<string, unknown>) => ({ ...search }) as { ref?: string },
	head: () => ({ meta: [{ title: `Project deposit | ${SITE.name}` }, { name: "robots", content: "noindex" }] }),
	component: DepositPage,
});

type Address = { name?: string; line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country: string };

function DepositPage() {
	const { ref } = Route.useSearch();
	const [origin, setOrigin] = useState<string | null>(null);
	useEffect(() => {
		setOrigin(window.location.origin);
		track("deposit_started", { plan: IDS.deposit.plan, amount: IDS.deposit.price, ref: ref ?? "" });
	}, [ref]);
	const elements = useMemo(() => (origin ? loadWhop() : null), [origin]);

	return (
		<div className="min-h-screen">
			<header className="border-b border-line">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
					<Link to="/" className="font-display text-2xl font-bold tracking-wide uppercase">{SITE.name}</Link>
					<Link to="/" className="text-sm text-muted underline decoration-line underline-offset-4">Back to site</Link>
				</div>
			</header>
			<main className="mx-auto grid max-w-5xl gap-10 px-5 py-12 md:grid-cols-[0.8fr_1.2fr]">
				<div>
					<p className="text-sm font-semibold tracking-widest text-accent uppercase">Reserve your install date</p>
					<h1 className="mt-2 font-display text-5xl leading-none font-bold uppercase">Project deposit</h1>
					<p className="mt-4 font-display text-4xl font-bold">{money(IDS.deposit.price)}</p>
					<ul className="mt-6 max-w-sm space-y-3 text-muted">
						<li>Holds your crew, materials and start date.</li>
						<li>Applied to your final invoice, not added on top.</li>
						<li className="flex gap-2"><Lock className="mt-1 size-4 shrink-0 text-accent" aria-hidden /> Your card is saved securely with Whop. We bill the remaining balance only when the job is finished, and you get an invoice first.</li>
					</ul>
				</div>
				<div className="rounded-card border border-line bg-white p-4 sm:p-6">
					{elements && origin ? (
						<WhopElements elements={elements}>
							<Payments
								accountId={IDS.account}
								plan={IDS.deposit.plan}
								setupFutureUsage="off_session"
								returnUrl={`${origin}/order-complete?kind=deposit`}
							>
								<DepositForm origin={origin} estimateRef={ref} />
							</Payments>
						</WhopElements>
					) : (
						<p className="py-16 text-center text-sm text-muted">Loading secure checkout...</p>
					)}
				</div>
			</main>
		</div>
	);
}

function DepositForm({ origin, estimateRef }: { origin: string; estimateRef?: string }) {
	const payments = usePayments();
	const whop = useWhop();
	const [email, setEmail] = useState({ email: "", complete: false });
	const [address, setAddress] = useState<{ complete: boolean; address: Address } | null>(null);
	const [paymentComplete, setPaymentComplete] = useState(false);
	const [stage, setStage] = useState<"idle" | "saving" | "charging">("idle");
	const [error, setError] = useState<string | null>(null);

	const ready = Boolean(payments) && email.complete && Boolean(address?.complete) && paymentComplete && stage === "idle";
	const returnUrl = `${origin}/order-complete?kind=deposit`;

	async function pay() {
		if (!payments || !whop || !address) return;
		setError(null);
		setStage("saving");
		try {
			// 1. Tokenize what the buyer entered. Wallet selections open their sheet here.
			const { confirmationToken } = await payments.createConfirmationToken({
				billingDetails: {
					email: email.email.trim(),
					name: address.address.name?.trim(),
					address: {
						line1: address.address.line1?.trim(),
						line2: address.address.line2?.trim() || undefined,
						city: address.address.city?.trim(),
						state: address.address.state?.trim(),
						postal_code: address.address.postal_code?.trim(),
						country: address.address.country,
					},
				},
			});

			// 2. Card on file: a setup intent saves the method without charging it.
			const setup = await startCardOnFile({ data: { confirmationToken, email: email.email.trim(), returnUrl, estimateRef } });
			if (setup.status !== "succeeded") {
				await whop.payments.handleNextAction({ clientSecret: setup.clientSecret, returnUrl }).catch(() => undefined);
			}
			let status = "processing";
			for (let attempt = 0; attempt < 30 && status !== "succeeded"; attempt++) {
				const state = await setupStatus({ data: setup.id });
				status = state.status;
				if (status === "canceled") throw new Error(state.message ?? "Your card could not be saved. Try another card.");
				if (status === "succeeded") break;
				await new Promise((resolve) => setTimeout(resolve, 1500));
			}
			if (status !== "succeeded") throw new Error("Saving your card is taking longer than expected. Please try again.");

			// 3. Charge the deposit to the card just saved.
			setStage("charging");
			const charge = await chargeDeposit({ data: { setupIntentId: setup.id, email: email.email.trim(), returnUrl } });
			if (charge.clientSecret) {
				await whop.payments.handleNextAction({ clientSecret: charge.clientSecret, returnUrl });
			}
			window.location.assign(returnUrl);
		} catch (failure) {
			setError(failure instanceof Error ? failure.message : "Your deposit could not be completed.");
			setStage("idle");
		}
	}

	return (
		<div className="space-y-5">
			<EmailElement onChange={(payload) => setEmail(payload)} />
			<AddressElement mode="billing" onChange={(payload) => setAddress(payload as { complete: boolean; address: Address })} />
			<PaymentElement fields={{ billingDetails: "never" }} onChange={(payload) => setPaymentComplete(payload.complete)} />
			{error ? <p className="text-sm font-medium text-red-700" role="alert">{error}</p> : null}
			<button
				type="button"
				disabled={!ready}
				onClick={pay}
				className="inline-flex min-h-12 w-full items-center justify-center rounded-card bg-accent px-6 font-semibold text-accent-ink hover:brightness-110 disabled:opacity-40"
			>
				{stage === "saving" ? "Saving your card..." : stage === "charging" ? "Charging deposit..." : `Pay ${money(IDS.deposit.price)} deposit and save card`}
			</button>
			<p className="text-center text-xs text-muted">
				By paying you agree to save this card for your final invoice. You will be invoiced before the balance is charged.
			</p>
			<BrandingElement />
		</div>
	);
}
