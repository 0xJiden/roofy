# Roofing company template

Deposit -> job -> final invoice flow on Whop.

- `src/lib/site.ts`: brand, copy, service area, reviews (SAMPLE content to replace) and the Whop plan IDs.
- `/` landing page with services, financing callout, service area, reviews and the Request an Estimate form.
- `/services/$slug`: fires `service_viewed`.
- `/checkout/$planId`: `ExpressCheckoutElement` + `CheckoutElement` + `BrandingElement` (inspection, flat-rate repair).
- `/deposit`: PaymentElement + wallets, saves the card with a setup intent, then charges the $500 deposit. Fires `deposit_started`.
- Estimate form -> `POST /leads` (`submitEstimate`). The visitor signs in with Whop once so the lead has a user. Fires `estimate_requested`.
- `src/lib/final-invoice.server.ts` + `POST /api/final-invoice`: final balance via the Invoices API (auto-charge the stored method, or send for manual payment). Requires the `ADMIN_TOKEN` app secret.
