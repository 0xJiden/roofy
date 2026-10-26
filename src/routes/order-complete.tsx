import { Link, createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { Page } from "#/components/shell";
import { IDS, SITE, money } from "#/lib/site";

export const Route = createFileRoute("/order-complete")({
	validateSearch: (search: Record<string, unknown>) => ({ ...search }) as { kind?: string },
	head: () => ({ meta: [{ title: `Thank you | ${SITE.name}` }, { name: "robots", content: "noindex" }] }),
	component: OrderComplete,
});

function OrderComplete() {
	const { kind } = Route.useSearch();
	const deposit = kind === "deposit";
	return (
		<Page>
			<section className="mx-auto max-w-3xl px-5 py-20 md:py-28">
				<span className="grid size-12 place-items-center rounded-full bg-accent text-accent-ink"><Check className="size-6" aria-hidden /></span>
				<h1 className="mt-6 font-display text-6xl leading-none font-bold uppercase">{deposit ? "Your date is reserved" : "Thank you"}</h1>
				<p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
					{deposit
						? `Your ${money(IDS.deposit.price)} deposit is in and your card is saved. We will confirm your crew and start date by email. A receipt is on its way.`
						: "Your payment is in. A receipt is on its way, and we will be in touch to schedule your visit."}
				</p>

				{deposit ? (
					<div className="mt-12 border-t border-line pt-10">
						<h2 className="font-display text-3xl font-bold uppercase">What happens with the final balance</h2>
						<ol className="mt-6 space-y-5">
							<li className="flex gap-4"><span className="font-display text-2xl text-accent">01</span><p className="text-muted">We finish the roof and send photos.</p></li>
							<li className="flex gap-4"><span className="font-display text-2xl text-accent">02</span><p className="text-muted">You receive an invoice for the remaining balance. Your {money(IDS.deposit.price)} deposit is already subtracted.</p></li>
							<li className="flex gap-4"><span className="font-display text-2xl text-accent">03</span><p className="text-muted">It is charged to the card you saved, or sent to you to pay another way. Your call at signing.</p></li>
						</ol>
					</div>
				) : null}

				<Link to="/" className="mt-12 inline-flex min-h-12 items-center rounded-card bg-ink px-6 font-semibold text-paper hover:brightness-125">Back to home</Link>
			</section>
		</Page>
	);
}
