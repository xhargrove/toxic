import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

const PROTECTED_PATHS = [
  "/onboarding",
  "/home",
  "/create",
  "/settings",
  "/admin",
] as const;

const AUTH_PAGES = ["/login", "/sign-up"] as const;

function pathStartsWith(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((path) => pathStartsWith(pathname, path));
}

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (isProtectedPath(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (user && AUTH_PAGES.some((path) => pathStartsWith(pathname, path))) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/home";

    return NextResponse.redirect(homeUrl);
  }

  return response;
}
