import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import type { ReactNode } from "react";

import { SITE } from "#/lib/site";

export function Header() {
	return (
		<header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
				<Link to="/" className="flex items-center gap-2.5">
					<span aria-hidden className="grid size-9 place-items-center rounded-card bg-ink font-display text-xl text-paper">R</span>
					<span className="font-display text-2xl leading-none font-bold tracking-wide uppercase">{SITE.name}</span>
				</Link>
				<nav className="flex items-center gap-6 text-sm font-medium">
					<a href="/#services" className="hidden text-muted hover:text-ink md:block">Services</a>
					<a href="/#area" className="hidden text-muted hover:text-ink md:block">Service area</a>
					<a href="/#financing" className="hidden text-muted hover:text-ink md:block">Financing</a>
					<a href="/#reviews" className="hidden text-muted hover:text-ink md:block">Reviews</a>
					<a href={SITE.phoneHref} className="hidden items-center gap-1.5 font-semibold sm:flex">
						<Phone className="size-4" aria-hidden /> {SITE.phone}
					</a>
					<a href="/#estimate" className="inline-flex min-h-11 items-center rounded-card bg-accent px-4 font-semibold text-accent-ink hover:brightness-110">
						Free estimate
					</a>
				</nav>
			</div>
		</header>
	);
}

export function Footer() {
	return (
		<footer className="bg-ink text-paper">
			<div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
				<div>
					<p className="font-display text-2xl font-bold tracking-wide uppercase">{SITE.name}</p>
					<p className="mt-3 max-w-xs text-sm text-paper/70">{SITE.tagline}. {SITE.license}.</p>
				</div>
				<div className="text-sm text-paper/80">
					<p className="font-semibold text-paper">Contact</p>
					<p className="mt-3"><a href={SITE.phoneHref} className="underline decoration-paper/30 underline-offset-4">{SITE.phone}</a></p>
					<p className="mt-1"><a href={`mailto:${SITE.email}`} className="underline decoration-paper/30 underline-offset-4">{SITE.email}</a></p>
					<p className="mt-1">{SITE.hours}</p>
				</div>
				<div className="text-sm text-paper/80">
					<p className="font-semibold text-paper">Book online</p>
					<ul className="mt-3 space-y-1">
						<li><Link to="/services/$slug" params={{ slug: "inspection" }} className="hover:text-paper">Roof inspection</Link></li>
						<li><Link to="/services/$slug" params={{ slug: "repair" }} className="hover:text-paper">Roof repair</Link></li>
						<li><Link to="/services/$slug" params={{ slug: "replacement" }} className="hover:text-paper">Roof replacement</Link></li>
					</ul>
				</div>
			</div>
			<div className="border-t border-paper/10 px-5 py-5 text-center text-xs text-paper/50">
				© {new Date().getFullYear()} {SITE.name}. Payments processed by Whop.
			</div>
		</footer>
	);
}

export function Page({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen">
			<Header />
			<main>{children}</main>
			<Footer />
		</div>
	);
}
