import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types";
const secret = process.env.AUTH_SECRET;
if (!secret) throw new Error("AUTH_SECRET is not set");
const key = new TextEncoder().encode(secret);
const COOKIE = "fmc_session";
const MAX_AGE = 60 * 60 * 24 * 30;
export async function signSession(u: SessionUser) {
  return new SignJWT({ ...u })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key);
}
export async function verifySession(t: string): Promise<SessionUser | null> {
  try { const { payload } = await jwtVerify(t, key); return payload as unknown as SessionUser; }
  catch { return null; }
}
export async function setSessionCookie(u: SessionUser) {
  cookies().set(COOKIE, await signSession(u), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: MAX_AGE
  });
}
export async function clearSessionCookie() {
  cookies().set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
export async function getCurrentUser(): Promise<SessionUser | null> {
  const t = cookies().get(COOKIE)?.value;
  if (!t) return null;
  return verifySession(t);
}
export async function requireUser(): Promise<SessionUser> {
  const u = await getCurrentUser();
  if (!u) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  return u;
}
export async function requireAdmin(): Promise<SessionUser> {
  const u = await requireUser();
  if (u.role !== "ADMIN") throw Object.assign(new Error("Forbidden"), { status: 403 });
  return u;
}