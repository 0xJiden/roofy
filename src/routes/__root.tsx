import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

import { SITE } from "#/lib/site";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "color-scheme", content: "light" },
			{ title: `${SITE.name} | ${SITE.tagline}` },
			{
				name: "description",
				content: "Roof repair, replacement and inspection with written quotes, flat-rate pricing, and a deposit that holds your install date.",
			},
			{ property: "og:title", content: `${SITE.name} | ${SITE.tagline}` },
			{ property: "og:image", content: `${SITE.origin}/img/hero.png` },
		],
		links: [
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{ rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600;700&display=swap",
			},
			{ rel: "stylesheet", href: appCss },
		],
	}),
	notFoundComponent: () => (
		<div className="mx-auto max-w-xl px-5 py-32 text-center">
			<h1 className="font-display text-6xl font-bold uppercase">Page not found</h1>
			<a href="/" className="mt-6 inline-block font-semibold underline underline-offset-4">Back to home</a>
		</div>
	),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="min-h-screen bg-paper text-ink">
				{children}
				<Scripts />
			</body>
		</html>
	);
}
