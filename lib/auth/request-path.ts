import "server-only";

import { headers } from "next/headers";

import { sanitizeNextPath } from "@/lib/auth/redirect-path";

const HEADER = "x-pathname";

/**
 * Pathname forwarded by middleware (`lib/auth/middleware.ts`) for accurate `?next=` redirects from layouts.
 */
export async function getMiddlewarePathname(): Promise<string> {
  const h = await headers();
  const raw = h.get(HEADER);
  return sanitizeNextPath(raw ?? undefined);
}
