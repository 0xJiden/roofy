import { IDS } from "#/lib/site";
import { whopPost } from "#/lib/whop.server";

/**
 * FINAL BALANCE, billed with the Whop Invoices API.
 *
 * After the roof is finished, the contractor bills (project total - $500 deposit):
 *
 *   1. POST /invoices           draft invoice backed by a one-time variant for the balance
 *   2. POST /invoices/:id/issue resolves tax and opens it
 *
 * Two ways to collect:
 *   - autoCharge: pass the `payment_method_id` saved at deposit checkout. Issuing the
 *     invoice charges that card off-session. Whop emails the receipt.
 *   - manual:    omit `payment_method_id` and pass the customer's email. The invoice
 *     opens for manual payment and the customer pays it their own way (card, wallet,
 *     or a financing option when approved).
 */
export type FinalInvoiceInput = {
	projectTotal: number;
	memberId?: string;
	email?: string;
	customerName?: string;
	paymentMethodId?: string; // present => auto-charge
	dueInDays?: number;
	jobRef?: string;
};

export async function createFinalInvoice(input: FinalInvoiceInput) {
	const balance = Math.round((input.projectTotal - IDS.deposit.price) * 100) / 100;
	if (!(balance > 0)) throw new Error("Project total must be larger than the $500 deposit.");
	if (!input.memberId && !input.email) throw new Error("Provide member_id or email.");

	const due = new Date(Date.now() + (input.dueInDays ?? 7) * 86_400_000).toISOString();

	const draft = await whopPost<{ id: string }>("/invoices", {
		account_id: IDS.account,
		member_id: input.memberId,
		email_address: input.memberId ? undefined : input.email,
		customer_name: input.memberId ? undefined : input.customerName,
		payment_method_id: input.paymentMethodId, // auto-charge when set
		recipient_emails: input.email ? [input.email] : undefined,
		due_at: due,
		metadata: { kind: "final_balance", job_ref: input.jobRef ?? "", deposit_credited: String(IDS.deposit.price) },
		items: [
			{
				quantity: 1,
				plan: {
					currency: "usd",
					plan_type: "one_time",
					initial_price: balance,
					title: "Roof project final balance",
					visibility: "hidden",
					force_create_new_plan: true,
					product: {
						external_identifier: "roofing-final-balance",
						title: "Roofing project balance",
						visibility: "hidden",
					},
				},
			},
		],
	});

	const issued = await whopPost<{ id: string; status?: string }>(`/invoices/${draft.id}/issue`, {});
	return { invoiceId: issued.id ?? draft.id, status: issued.status, balance, autoCharged: Boolean(input.paymentMethodId) };
}
