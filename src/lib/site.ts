// One place to rebrand the template. Everything marked SAMPLE is placeholder
// copy that must be replaced with the real company's facts before launch.

export const SITE = {
	name: "Roofy Roofing", // SAMPLE: replace with the company's legal trade name
	tagline: "Roof repair, replacement and inspection",
	phone: "(555) 010-0142", // SAMPLE
	phoneHref: "tel:+15550100142", // SAMPLE
	email: "hello@roofy.example", // SAMPLE
	license: "State license no. on request", // SAMPLE: put the real license number here
	hours: "Mon to Sat, 7am to 6pm",
	origin: "https://roofy.whop.site",
} as const;

// Real Whop IDs created for this account.
export const IDS = {
	account: "biz_yeZrwkmMDMYYAk",
	inspection: { product: "prod_HeumOrHGFEyp1", plan: "plan_u5Er3BXtrS0CH", price: 149 },
	deposit: { product: "prod_6LVDeYU6CT46G", plan: "plan_aZHtbcs6FVqCI", price: 500 },
	repair: { product: "prod_k4FuZ0XD5RptR", plan: "plan_bAXzP15kT9HvS", price: 395 },
} as const;

export type ServiceSlug = "repair" | "replacement" | "inspection";

export type Service = {
	slug: ServiceSlug;
	title: string;
	short: string;
	body: string;
	priceLine: string;
	includes: string[];
	steps: { title: string; body: string }[];
	// How the visitor buys: straight to a checkout, or by asking for an estimate.
	cta: { label: string; kind: "checkout"; planId: string } | { label: string; kind: "estimate" };
	productId: string;
};

export const SERVICES: Service[] = [
	{
		slug: "inspection",
		title: "Roof inspection",
		short: "A licensed inspector on your roof, a photo report in your inbox.",
		body: "We go over shingles, flashing, vents, gutters and decking, photograph every problem, and send a written report with a firm quote. If you hire us, the fee comes off your project.",
		priceLine: "$149 flat fee, credited to your project",
		includes: [
			"Full roof walk and attic check when accessible",
			"Photo report with every issue marked",
			"Written quote you can compare, valid 30 days",
			"Insurance claim documentation on request",
		],
		steps: [
			{ title: "Book and pay the $149 fee", body: "Pick your slot at checkout. Apple Pay, Google Pay and cards work." },
			{ title: "We inspect", body: "Usually within a few business days. You do not need to be home." },
			{ title: "You get the report", body: "Photos, findings and a firm quote, by email." },
		],
		cta: { label: "Book an inspection", kind: "checkout", planId: IDS.inspection.plan },
		productId: IDS.inspection.product,
	},
	{
		slug: "repair",
		title: "Roof repair",
		short: "Leaks, missing shingles and storm damage, fixed at one flat price.",
		body: "Our minor repair is a flat $395: up to two hours of labor, up to ten replaced shingles, sealant, flashing touch-ups and cleanup. Bigger problem? We tell you before we start and quote it in writing.",
		priceLine: "$395 flat rate, no surprise add-ons",
		includes: [
			"Up to 2 hours of labor",
			"Up to 10 shingles replaced to match",
			"Sealant and flashing touch-ups",
			"Debris hauled away",
		],
		steps: [
			{ title: "Book the flat-rate repair", body: "Pay at checkout and tell us where the leak is." },
			{ title: "We schedule a visit", body: "Most repairs are done in a single trip." },
			{ title: "Fixed and cleaned up", body: "If it is bigger than a flat-rate job, you get a written quote first." },
		],
		cta: { label: "Book a repair", kind: "checkout", planId: IDS.repair.plan },
		productId: IDS.repair.product,
	},
	{
		slug: "replacement",
		title: "Roof replacement",
		short: "A full tear-off and new roof, with a deposit to hold your date.",
		body: "Replacements are quoted from an inspection. When you approve the quote, a $500 deposit reserves your crew and materials, and your card is saved so the remaining balance is billed by invoice when the job is done.",
		priceLine: "Quoted per roof, $500 deposit to reserve",
		includes: [
			"Full tear-off and deck repair",
			"Underlayment, flashing, vents and ridge cap",
			"Magnetic nail sweep and full cleanup",
			"Written workmanship warranty",
		],
		steps: [
			{ title: "Get your estimate", body: "Request an estimate or book an inspection. Either way you get a written quote." },
			{ title: "Reserve with a $500 deposit", body: "Your card is saved securely. Nothing else is charged until the job is done." },
			{ title: "We build, then invoice the balance", body: "Final invoice is auto-charged to your saved card, or sent to you to pay your way." },
		],
		cta: { label: "Request an estimate", kind: "estimate" },
		productId: IDS.inspection.product,
	},
];

export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);

// SAMPLE service area: swap for the company's real counties and cities.
export const SERVICE_AREA = {
	headline: "Serving homeowners across the metro and its suburbs",
	regions: [
		{ name: "North side", towns: ["Cedar Park", "Round Rock", "Georgetown", "Pflugerville"] },
		{ name: "Central", towns: ["Downtown", "Hyde Park", "Zilker", "Mueller"] },
		{ name: "South and west", towns: ["Kyle", "Buda", "Bee Cave", "Lakeway"] },
	],
	note: "Not on the list? Ask. We often travel for full replacements.",
};

// SAMPLE reviews. Replace with real customer reviews before launch.
export const REVIEWS = [
	{ quote: "They found the actual source of the leak in one visit and the flat price was the price.", name: "Dana R.", town: "Cedar Park", service: "Repair" },
	{ quote: "The photo report made it easy to say yes. The crew was done in two days and the yard was spotless.", name: "Marcus T.", town: "Round Rock", service: "Replacement" },
	{ quote: "I liked that the deposit was credited and the final bill came as an invoice I could pay when I was ready.", name: "Priya S.", town: "Lakeway", service: "Replacement" },
];

export const TRUST = [
	{ title: "Licensed and insured", body: "Ask for the certificate. We send it before any work starts." },
	{ title: "Written quotes", body: "Every price is on paper. No verbal numbers." },
	{ title: "Photo documentation", body: "Before and after photos on every job." },
	{ title: "Warranty in writing", body: "Workmanship coverage is listed on your quote." },
];

export const FINANCING = {
	headline: "Don't wait on a leak to save up",
	body: "Pay for your inspection, repair or deposit at checkout with a monthly payment option such as Klarna, Afterpay or Affirm, when you qualify. Available options show up automatically for your order and your location.",
};

export const money = (n: number) =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
		maximumFractionDigits: 2,
	}).format(n);
