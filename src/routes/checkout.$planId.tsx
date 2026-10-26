import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { loadWhop } from "@whop/elements";
import { BrandingElement, Checkout, CheckoutElement, ExpressCheckoutElement, Payments, WhopElements } from "@whop/elements-react";
import { useEffect, useMemo, useState } from "react";

import { IDS, SITE, money } from "#/lib/site";

const OFFERS: Record<string, { title: string; price: number; blurb: string }> = {
	[IDS.inspection.plan]: { title: "Roof inspection", price: IDS.inspection.price, blurb: "Photo report and written quote. Credited to your project if you hire us." },
	[IDS.repair.plan]: { title: "Minor roof repair (flat rate)", price: IDS.repair.price, blurb: "Up to 2 hours of labor, up to 10 shingles, sealant and cleanup." },
};

export const Route = createFileRoute("/checkout/$planId")({
	beforeLoad: ({ params }) => {
		// The deposit saves a card for the final invoice, so it has its own checkout.
		if (params.planId === IDS.deposit.plan) throw redirect({ to: "/deposit" });
	},
	head: () => ({ meta: [{ title: `Checkout | ${SITE.name}` }, { name: "robots", content: "noindex" }] }),
	component: CheckoutPage,
});

function CheckoutPage() {
	const { planId } = Route.useParams();
	const offer = OFFERS[planId];
	const [origin, setOrigin] = useState<string | null>(null);
	useEffect(() => setOrigin(window.location.origin), []);
	// The SDK is browser-only. Load it once after mount.
	const elements = useMemo(() => (origin ? loadWhop() : null), [origin]);

	if (!offer) {
		return (
			<Shell>
				<h1 className="font-display text-5xl font-bold uppercase">We could not find that service</h1>
				<Link to="/" className="mt-6 inline-block font-semibold underline underline-offset-4">Back to home</Link>
			</Shell>
		);
	}

	const returnUrl = `${origin}/order-complete?kind=service`;

	return (
		<Shell>
			<div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
				<div>
					<p className="text-sm font-semibold tracking-widest text-accent uppercase">Checkout</p>
					<h1 className="mt-2 font-display text-5xl leading-none font-bold uppercase">{offer.title}</h1>
					<p className="mt-4 font-display text-4xl font-bold">{money(offer.price)}</p>
					<p className="mt-3 max-w-sm text-muted">{offer.blurb}</p>
					<p className="mt-6 text-sm text-muted">Pay in full or choose a monthly payment option below when you qualify.</p>
				</div>
				<div className="rounded-card border border-line bg-white p-4 sm:p-6">
					{elements && origin ? (
						<WhopElements elements={elements}>
							{/* Apple Pay and Google Pay. A handle mounts either the express buttons or the full checkout. */}
							<Checkout plan={planId} returnUrl={returnUrl} metadata={{ source: "roofing_site", offer: offer.title }}>
								<ExpressCheckoutElement layout="vertical" />
							</Checkout>
							<div className="my-5 flex items-center gap-3 text-xs tracking-widest text-muted uppercase">
								<span className="h-px flex-1 bg-line" /> or pay another way <span className="h-px flex-1 bg-line" />
							</div>
							{/* The full hosted checkout: summary, promo code, cards, and financing methods for approved merchants. */}
							<Checkout plan={planId} returnUrl={returnUrl} metadata={{ source: "roofing_site", offer: offer.title }}>
								<CheckoutElement />
							</Checkout>
							{/* Required merchant-of-record notice. */}
							<Payments>
								<BrandingElement />
							</Payments>
						</WhopElements>
					) : (
						<p className="py-16 text-center text-sm text-muted">Loading secure checkout...</p>
					)}
				</div>
			</div>
		</Shell>
	);
}

function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen">
			<header className="border-b border-line">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
					<Link to="/" className="font-display text-2xl font-bold tracking-wide uppercase">{SITE.name}</Link>
					<Link to="/" className="text-sm text-muted underline decoration-line underline-offset-4">Back to site</Link>
				</div>
			</header>
			<main className="mx-auto max-w-5xl px-5 py-12">{children}</main>
		</div>
	);
}
