import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Camera, CreditCard, FileText, MapPin, Phone, ShieldCheck, Star } from "lucide-react";

import { EstimateForm } from "#/components/estimate-form";
import { Page } from "#/components/shell";
import { FINANCING, IDS, REVIEWS, SERVICES, SERVICE_AREA, SITE, TRUST, money } from "#/lib/site";

export const Route = createFileRoute("/")({
	validateSearch: (search: Record<string, unknown>) => ({ ...search }) as { resume?: string },
	head: () => ({
		meta: [
			{ title: `${SITE.name} | Roof repair, replacement and inspection` },
			{ name: "description", content: "Written quotes, flat-rate repairs, and a $500 deposit that holds your install date. Request a free estimate online." },
			{ property: "og:image", content: `${SITE.origin}/img/hero.png` },
		],
	}),
	component: Home,
});

function Home() {
	const search = Route.useSearch();
	return (
		<Page>
			<Hero />
			<Services />
			<Process />
			<Financing />
			<Area />
			<Reviews />
			<Estimate resume={search.resume === "estimate"} />
		</Page>
	);
}

function Hero() {
	return (
		<section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-10 pb-16 md:grid-cols-[1.05fr_1fr] md:pt-16 md:pb-24">
			<div>
				<p className="text-sm font-semibold tracking-widest text-accent uppercase">Licensed, insured, locally owned</p>
				<h1 className="mt-4 font-display text-6xl leading-[0.95] font-bold tracking-tight text-balance uppercase md:text-8xl">
					A roof you will not think about again
				</h1>
				<p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
					Written quotes, photo reports, and flat-rate repairs. For a full replacement, a {money(IDS.deposit.price)} deposit holds your date and the balance is invoiced when the job is done.
				</p>
				<div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
					<a href="#estimate" className="inline-flex min-h-12 items-center gap-2 rounded-card bg-accent px-6 font-semibold text-accent-ink hover:brightness-110">
						Request an estimate <ArrowRight className="size-4" aria-hidden />
					</a>
					<Link to="/services/$slug" params={{ slug: "inspection" }} className="font-semibold underline decoration-line underline-offset-4 hover:decoration-ink">
						Book an inspection for {money(IDS.inspection.price)}
					</Link>
				</div>
				<a href={SITE.phoneHref} className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted">
					<Phone className="size-4" aria-hidden /> Prefer to talk? {SITE.phone}
				</a>
			</div>
			<img src="/img/hero.png" alt="Roofing crew installing charcoal shingles on a house in late afternoon light" className="aspect-4/3 w-full rounded-card object-cover" />
		</section>
	);
}

function Services() {
	return (
		<section id="services" className="border-t border-line">
			<div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[0.8fr_1.4fr] md:py-28">
				<div>
					<h2 className="font-display text-5xl leading-none font-bold uppercase md:text-6xl">What we do</h2>
					<p className="mt-4 max-w-xs text-muted">Pick the one that fits. Not sure? Start with an inspection.</p>
				</div>
				<ol className="divide-y divide-line border-y border-line">
					{SERVICES.map((service, index) => (
						<li key={service.slug}>
							<Link to="/services/$slug" params={{ slug: service.slug }} className="group grid gap-2 py-7 sm:grid-cols-[3rem_1fr_auto] sm:items-start sm:gap-6">
								<span className="font-display text-3xl text-accent tabular-nums">{String(index + 1).padStart(2, "0")}</span>
								<div>
									<h3 className="text-xl font-semibold">{service.title}</h3>
									<p className="mt-1 max-w-md text-muted">{service.short}</p>
									<p className="mt-2 text-sm font-semibold">{service.priceLine}</p>
								</div>
								<ArrowRight className="mt-1 hidden size-5 text-muted transition group-hover:translate-x-1 group-hover:text-accent sm:block" aria-hidden />
							</Link>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}

const STEPS = [
	{ icon: FileText, title: "Estimate or inspection", body: "A written quote with photos. The $149 inspection fee is credited if you hire us." },
	{ icon: CreditCard, title: "Deposit holds your date", body: "$500 reserves crew and materials. Your card is saved securely, nothing else is charged yet." },
	{ icon: Camera, title: "We build it", body: "Tear-off, install and cleanup, with before and after photos." },
	{ icon: BadgeCheck, title: "Final invoice", body: "The balance, less your deposit, is invoiced. Auto-charged to your saved card, or sent to you to pay your way." },
];

function Process() {
	return (
		<section className="bg-ink text-paper">
			<div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
				<h2 className="max-w-2xl font-display text-5xl leading-none font-bold uppercase md:text-6xl">How a replacement is paid for</h2>
				<ol className="mt-12 grid gap-px overflow-hidden rounded-card bg-paper/15 md:grid-cols-4">
					{STEPS.map((step, index) => (
						<li key={step.title} className="bg-ink p-6">
							<step.icon className="size-6 text-accent" aria-hidden />
							<p className="mt-5 text-xs font-semibold tracking-widest text-paper/50 uppercase">Step {index + 1}</p>
							<h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-paper/70">{step.body}</p>
						</li>
					))}
				</ol>
				<div className="mt-10">
					<Link to="/deposit" className="inline-flex min-h-12 items-center gap-2 rounded-card bg-accent px-6 font-semibold text-accent-ink hover:brightness-110">
						Already have a quote? Pay the {money(IDS.deposit.price)} deposit <ArrowRight className="size-4" aria-hidden />
					</Link>
				</div>
			</div>
		</section>
	);
}

function Financing() {
	return (
		<section id="financing" className="relative isolate overflow-hidden">
			<img src="/img/band.png" alt="" className="absolute inset-0 -z-10 size-full object-cover" />
			<div className="absolute inset-0 -z-10 bg-ink/70" />
			<div className="mx-auto max-w-6xl px-5 py-24 text-paper md:py-32">
				<p className="text-sm font-semibold tracking-widest text-accent uppercase">Financing</p>
				<h2 className="mt-3 max-w-2xl font-display text-5xl leading-none font-bold uppercase text-balance md:text-7xl">{FINANCING.headline}</h2>
				<p className="mt-6 max-w-xl text-lg leading-relaxed text-paper/85">{FINANCING.body}</p>
				<p className="mt-4 text-sm text-paper/60">Subject to approval. Options depend on the amount and where you live.</p>
			</div>
		</section>
	);
}

function Area() {
	return (
		<section id="area" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
			<div className="flex items-center gap-3 text-accent"><MapPin className="size-5" aria-hidden /><span className="text-sm font-semibold tracking-widest uppercase">Service area</span></div>
			<h2 className="mt-3 max-w-2xl font-display text-5xl leading-none font-bold uppercase text-balance md:text-6xl">{SERVICE_AREA.headline}</h2>
			<div className="mt-12 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
				{SERVICE_AREA.regions.map((region) => (
					<div key={region.name} className="bg-paper p-6">
						<h3 className="font-semibold">{region.name}</h3>
						<p className="mt-2 leading-relaxed text-muted">{region.towns.join(", ")}</p>
					</div>
				))}
			</div>
			<p className="mt-5 text-sm text-muted">{SERVICE_AREA.note}</p>
		</section>
	);
}

function Reviews() {
	return (
		<section id="reviews" className="bg-card">
			<div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
				<h2 className="font-display text-5xl leading-none font-bold uppercase md:text-6xl">What homeowners say</h2>
				<div className="mt-12 grid gap-8 md:grid-cols-3">
					{REVIEWS.map((review) => (
						<figure key={review.name} className="border-t-2 border-ink pt-5">
							<div className="flex gap-0.5 text-accent" aria-label="5 out of 5 stars">
								{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" aria-hidden />)}
							</div>
							<blockquote className="mt-4 text-lg leading-relaxed">“{review.quote}”</blockquote>
							<figcaption className="mt-4 text-sm text-muted">{review.name}, {review.town} · {review.service}</figcaption>
						</figure>
					))}
				</div>
				<ul className="mt-16 grid gap-x-8 gap-y-6 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-4">
					{TRUST.map((item) => (
						<li key={item.title} className="flex gap-3">
							<ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
							<div>
								<p className="font-semibold">{item.title}</p>
								<p className="mt-1 text-sm text-muted">{item.body}</p>
							</div>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}

function Estimate({ resume }: { resume: boolean }) {
	return (
		<section id="estimate" className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[0.85fr_1.15fr] md:py-28">
			<div>
				<h2 className="font-display text-5xl leading-none font-bold uppercase md:text-6xl">Get your free estimate</h2>
				<p className="mt-5 max-w-sm text-lg leading-relaxed text-muted">Tell us about the roof. We call within one business day to set a time.</p>
				<dl className="mt-10 space-y-5 text-sm">
					<div><dt className="font-semibold">Call</dt><dd className="mt-1 text-muted"><a href={SITE.phoneHref} className="underline decoration-line underline-offset-4">{SITE.phone}</a></dd></div>
					<div><dt className="font-semibold">Email</dt><dd className="mt-1 text-muted"><a href={`mailto:${SITE.email}`} className="underline decoration-line underline-offset-4">{SITE.email}</a></dd></div>
					<div><dt className="font-semibold">Hours</dt><dd className="mt-1 text-muted">{SITE.hours}</dd></div>
				</dl>
			</div>
			<EstimateForm resume={resume} />
		</section>
	);
}
