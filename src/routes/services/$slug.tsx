import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { useEffect } from "react";

import { Page } from "#/components/shell";
import { IDS, SITE, money, serviceBySlug } from "#/lib/site";
import { track } from "#/lib/track";

export const Route = createFileRoute("/services/$slug")({
	loader: ({ params }) => {
		const service = serviceBySlug(params.slug);
		if (!service) throw notFound();
		return { service };
	},
	head: ({ loaderData }) => ({
		meta: [
			{ title: loaderData ? `${loaderData.service.title} | ${SITE.name}` : SITE.name },
			{ name: "description", content: loaderData?.service.short ?? SITE.tagline },
			{ property: "og:image", content: `${SITE.origin}/img/hero.png` },
		],
	}),
	notFoundComponent: () => (
		<Page>
			<div className="mx-auto max-w-2xl px-5 py-32 text-center">
				<h1 className="font-display text-5xl font-bold uppercase">Service not found</h1>
				<Link to="/" className="mt-6 inline-block font-semibold underline underline-offset-4">Back to home</Link>
			</div>
		</Page>
	),
	component: ServicePage,
});

function ServicePage() {
	const { service } = Route.useLoaderData();

	useEffect(() => {
		track("service_viewed", { service: service.slug, title: service.title });
	}, [service.slug, service.title]);

	return (
		<Page>
			<section className="mx-auto grid max-w-6xl gap-12 px-5 pt-12 pb-20 md:grid-cols-[1.2fr_0.8fr] md:pt-20 md:pb-28">
				<div>
					<Link to="/" hash="services" className="text-sm font-medium text-muted hover:text-ink">← All services</Link>
					<h1 className="mt-5 font-display text-6xl leading-[0.95] font-bold uppercase md:text-8xl">{service.title}</h1>
					<p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{service.body}</p>
					<ul className="mt-10 divide-y divide-line border-y border-line">
						{service.includes.map((item) => (
							<li key={item} className="flex items-start gap-4 py-4 text-lg">
								<Check className="mt-1 size-5 shrink-0 text-accent" aria-hidden /> {item}
							</li>
						))}
					</ul>
					<ol className="mt-12 grid gap-8 sm:grid-cols-3">
						{service.steps.map((step, index) => (
							<li key={step.title}>
								<span className="font-display text-3xl text-accent tabular-nums">{String(index + 1).padStart(2, "0")}</span>
								<h3 className="mt-1 font-semibold">{step.title}</h3>
								<p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
							</li>
						))}
					</ol>
				</div>

				<aside className="h-fit rounded-card border border-line bg-card p-7 md:sticky md:top-24">
					<p className="text-sm font-semibold tracking-widest text-muted uppercase">Price</p>
					<p className="mt-2 font-display text-5xl font-bold">
						{service.slug === "inspection" ? money(IDS.inspection.price) : service.slug === "repair" ? money(IDS.repair.price) : "Custom quote"}
					</p>
					<p className="mt-1 text-sm text-muted">{service.priceLine}</p>
					<div className="mt-7 space-y-3">
						{service.cta.kind === "checkout" ? (
							<Link
								to="/checkout/$planId"
								params={{ planId: service.cta.planId }}
								className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-card bg-accent px-6 font-semibold text-accent-ink hover:brightness-110"
							>
								{service.cta.label} <ArrowRight className="size-4" aria-hidden />
							</Link>
						) : (
							<>
								<Link to="/" hash="estimate" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-card bg-accent px-6 font-semibold text-accent-ink hover:brightness-110">
									{service.cta.label} <ArrowRight className="size-4" aria-hidden />
								</Link>
								<Link to="/deposit" className="inline-flex min-h-12 w-full items-center justify-center rounded-card border border-ink/20 px-6 font-semibold hover:border-ink/50">
									Approved a quote? Pay deposit
								</Link>
							</>
						)}
					</div>
					<p className="mt-5 text-xs leading-relaxed text-muted">Apple Pay, Google Pay and cards. Monthly payment options appear at checkout when you qualify.</p>
				</aside>
			</section>
		</Page>
	);
}
