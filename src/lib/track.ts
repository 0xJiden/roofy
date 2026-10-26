type Props = Record<string, string | number | boolean>;

/** Custom pixel events. Page views and checkout events are automatic on whop.app. */
export function track(event: "estimate_requested" | "service_viewed" | "deposit_started", props: Props = {}) {
	if (typeof window === "undefined") return;
	try {
		(window as unknown as { whop?: { track?: (name: string, props?: Props) => void } }).whop?.track?.(event, props);
	} catch {
		// The pixel is absent in the preview; never break the page over analytics.
	}
}
