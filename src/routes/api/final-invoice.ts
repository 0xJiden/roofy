import { createFileRoute } from "@tanstack/react-router";

import { createFinalInvoice, type FinalInvoiceInput } from "#/lib/final-invoice.server";

const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/**
 * Contractor-only endpoint. Call it when a job is finished:
 *   curl -X POST https://<site>/api/final-invoice \
 *     -H "Authorization: Bearer $ADMIN_TOKEN" -H "content-type: application/json" \
 *     -d '{"projectTotal": 11800, "email": "homeowner@example.com", "paymentMethodId": "payt_..."}'
 * Set the ADMIN_TOKEN app secret first. Without it this route refuses every call.
 */
export const Route = createFileRoute("/api/final-invoice")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const secret = process.env.ADMIN_TOKEN;
				if (!secret) return json({ error: "ADMIN_TOKEN is not set for this site." }, 503);
				const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
				if (given.length !== secret.length || given !== secret) return json({ error: "Unauthorized" }, 401);
				try {
					const body = (await request.json()) as FinalInvoiceInput;
					return json(await createFinalInvoice(body));
				} catch (error) {
					return json({ error: error instanceof Error ? error.message : "Could not create the invoice." }, 400);
				}
			},
		},
	},
});
