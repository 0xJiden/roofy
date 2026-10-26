import { getCookie, setCookie } from "@tanstack/react-start/server";

const COOKIE = { httpOnly: true, secure: true, sameSite: "lax", path: "/" } as const;

type Token = { access_token: string; refresh_token: string; expires_in: number };

export type Visitor = { id: string; name?: string; email?: string };

export function writeSession(token: Token) {
	setCookie("wa", token.access_token, { ...COOKIE, maxAge: token.expires_in });
	setCookie("wr", token.refresh_token, { ...COOKIE, maxAge: 60 * 60 * 24 * 30 });
}

export function clearSession() {
	for (const name of ["wa", "wr"]) setCookie(name, "", { ...COOKIE, maxAge: 0 });
}

async function refreshAccessToken(): Promise<string | null> {
	const refreshToken = getCookie("wr");
	if (!refreshToken) return null;
	const response = await fetch(`${process.env.WHOP_API_ORIGIN}/oauth/token`, {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "refresh_token",
			client_id: process.env.APP_ID ?? "",
			refresh_token: refreshToken,
		}),
	});
	if (!response.ok) return null;
	const token = (await response.json()) as Token;
	writeSession(token);
	return token.access_token;
}

async function userinfo(accessToken: string): Promise<Visitor | null> {
	const response = await fetch(`${process.env.WHOP_API_ORIGIN}/oauth/userinfo`, {
		headers: { Authorization: `Bearer ${accessToken}`, "x-whop-inject-key": "none" },
	});
	if (!response.ok) return null;
	const info = (await response.json()) as { sub: string; name?: string; email?: string };
	return { id: info.sub, name: info.name, email: info.email };
}

/** The signed-in Whop visitor, or null. */
export async function currentVisitor(): Promise<Visitor | null> {
	let accessToken = getCookie("wa") ?? (await refreshAccessToken()) ?? undefined;
	if (!accessToken) return null;
	const profile = await userinfo(accessToken);
	if (profile) return profile;
	accessToken = (await refreshAccessToken()) ?? undefined;
	return accessToken ? await userinfo(accessToken) : null;
}
