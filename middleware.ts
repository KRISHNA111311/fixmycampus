import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Scans all cookies for standard auth naming conventions
  const hasAuthCookie = request.cookies.getAll().some(cookie => 
    cookie.name.toLowerCase().includes("token") || 
    cookie.name.toLowerCase().includes("session") ||
    cookie.name.toLowerCase().includes("auth")
  );
  
  if (!hasAuthCookie && request.nextUrl.pathname.startsWith("/report")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/report/:path*"],
};
