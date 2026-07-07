import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    // Gracefully bypass middleware checks if Supabase is not configured yet
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const userRole = user.user_metadata?.role || "buyer";

    // Prevent cross-dashboard access
    if (pathname.startsWith("/dashboard/farmer") && userRole !== "farmer") {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${userRole}`;
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/dashboard/buyer") && userRole !== "buyer") {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${userRole}`;
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/dashboard/transporter") && userRole !== "transporter") {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${userRole}`;
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${userRole}`;
      return NextResponse.redirect(url);
    }
  }

  // Redirect logged-in users away from auth pages to their dashboards
  if (user && (pathname === "/login" || pathname === "/register")) {
    const userRole = user.user_metadata?.role || "buyer";
    const url = request.nextUrl.clone();
    url.pathname = `/dashboard/${userRole}`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/SVGs
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
