import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/security/auth-session";

// Public routes that do NOT require passcode authentication
const PUBLIC_PATHS = [
  "/login",
  "/privacy",
  "/terms",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/google/callback",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow static files, Next.js internal chunks, icons
  if (
    pathname.startsWith("/_next") ||
    pathname === "/icon.svg" ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  // 2. Allow public paths
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isPublic) {
    // If already logged in and visiting /login, redirect to dashboard
    if (pathname === "/login") {
      const authCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
      if (await verifySessionToken(authCookie)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    return NextResponse.next();
  }

  // 3. Check authentication cookie
  const authCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = await verifySessionToken(authCookie);

  if (!isAuthenticated) {
    // For API calls, respond with 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized: Master passcode required to access MailSprint" },
        { status: 401 }
      );
    }

    // For page requests, redirect to /login
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
