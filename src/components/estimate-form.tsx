import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SERVICES, type ServiceSlug } from "#/lib/site";
import { getVisitor, submitEstimate, type EstimateInput } from "#/lib/server-fns";
import { track } from "#/lib/track";

const STORAGE_KEY = "roof-estimate-draft";

const blank: EstimateInput = {
	service: "replacement",
	name: "",
	phone: "",
	email: "",
	address: "",
	zip: "",
	timeline: "Within 30 days",
	details: "",
};

export function EstimateForm({ resume }: { resume: boolean }) {
	const [form, setForm] = useState<EstimateInput>(blank);
	const [state, setState] = useState<"idle" | "sending" | "done">("idle");
	const [error, setError] = useState<string | null>(null);
	const resumed = useRef(false);

	const set = <K extends keyof EstimateInput>(key: K, value: EstimateInput[K]) => setForm((prev) => ({ ...prev, [key]: value }));

	async function send(values: EstimateInput) {
		setState("sending");
		setError(null);
		const result = await submitEstimate({ data: { ...values, referrer: document.referrer || window.location.href } });
		if (result.ok) {
			sessionStorage.removeItem(STORAGE_KEY);
			track("estimate_requested", { service: values.service, zip: values.zip, timeline: values.timeline });
			setState("done");
			return;
		}
		if (result.reason === "signed_out") {
			// The Leads API attaches the request to a Whop user, so sign in once, then we send it.
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(values));
			window.location.assign(`/api/oauth/login?redirect_to=${encodeURIComponent("/?resume=estimate")}`);
			return;
		}
		setState("idle");
		setError(result.message ?? "Something went wrong. Please call us.");
	}

	useEffect(() => {
		if (resumed.current) return;
		resumed.current = true;
		const saved = sessionStorage.getItem(STORAGE_KEY);
		if (!saved) {
			getVisitor().then((visitor) => visitor?.email && setForm((prev) => ({ ...prev, email: prev.email || visitor.email! })));
			return;
		}
		const values = { ...blank, ...(JSON.parse(saved) as EstimateInput) };
		setForm(values);
		if (resume) void send(values);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (state === "done") {
		return (
			<div className="rounded-card border border-line bg-white p-8" role="status">
				<span className="grid size-11 place-items-center rounded-full bg-accent text-accent-ink"><Check className="size-5" aria-hidden /></span>
				<h3 className="mt-5 font-display text-3xl font-bold uppercase">Request received</h3>
				<p className="mt-3 text-muted">
					We will call {form.phone ? `you at ${form.phone}` : "you"} within one business day to set up your estimate. If you would rather lock in a time now, book a paid inspection. The $149 comes off your project.
				</p>
				<Link
					to="/services/$slug"
					params={{ slug: "inspection" }}
					className="mt-6 inline-flex min-h-12 items-center rounded-card bg-ink px-5 font-semibold text-paper hover:brightness-125"
				>
					Book an inspection
				</Link>
			</div>
		);
	}

	return (
		<form
			className="rounded-card border border-line bg-white p-6 md:p-8"
			onSubmit={(event) => {
				event.preventDefault();
				void send(form);
			}}
		>
			<div className="grid gap-4 sm:grid-cols-2">
				<label className="block text-sm font-semibold sm:col-span-2">
					What do you need?
					<select className="field mt-1.5 font-normal" value={form.service} onChange={(e) => set("service", e.target.value as ServiceSlug)}>
						{SERVICES.map((s) => (
							<option key={s.slug} value={s.slug}>{s.title}</option>
						))}
					</select>
				</label>
				<label className="block text-sm font-semibold">
					Full name
					<input className="field mt-1.5 font-normal" required autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
				</label>
				<label className="block text-sm font-semibold">
					Phone
					<input className="field mt-1.5 font-normal" required type="tel" autoComplete="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
				</label>
				<label className="block text-sm font-semibold sm:col-span-2">
					Email
					<input className="field mt-1.5 font-normal" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
				</label>
				<label className="block text-sm font-semibold">
					Property address
					<input className="field mt-1.5 font-normal" required autoComplete="street-address" value={form.address} onChange={(e) => set("address", e.target.value)} />
				</label>
				<label className="block text-sm font-semibold">
					ZIP code
					<input className="field mt-1.5 font-normal" required inputMode="numeric" autoComplete="postal-code" pattern="\d{5}(-\d{4})?" title="5-digit ZIP code" value={form.zip} onChange={(e) => set("zip", e.target.value)} />
				</label>
				<label className="block text-sm font-semibold sm:col-span-2">
					When do you want it done?
					<select className="field mt-1.5 font-normal" value={form.timeline} onChange={(e) => set("timeline", e.target.value)}>
						<option>As soon as possible</option>
						<option>Within 30 days</option>
						<option>In 1 to 3 months</option>
						<option>Just planning</option>
					</select>
				</label>
				<label className="block text-sm font-semibold sm:col-span-2">
					Tell us what is going on <span className="font-normal text-muted">(optional)</span>
					<textarea className="field mt-1.5 min-h-28 font-normal" value={form.details} onChange={(e) => set("details", e.target.value)} placeholder="Leak over the kitchen, missing shingles after the storm, roof is 20 years old..." />
				</label>
			</div>
			{error ? <p className="mt-4 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
			<button
				type="submit"
				disabled={state === "sending"}
				className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-card bg-accent px-6 font-semibold text-accent-ink hover:brightness-110 disabled:opacity-60"
			>
				{state === "sending" ? "Sending..." : "Request my free estimate"}
			</button>
			<p className="mt-3 text-center text-xs text-muted">
				You will confirm with a quick Whop sign-in so your request is saved to your account. No payment needed.
			</p>
		</form>
	);
}
