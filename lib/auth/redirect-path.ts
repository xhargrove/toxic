const DEFAULT_NEXT = "/home";

/**
 * Validates `next` for post-login redirects. Only same-origin relative paths are allowed.
 */
export function sanitizeNextPath(
  next: string | undefined | null,
  fallback: string = DEFAULT_NEXT
): string {
  if (next == null || typeof next !== "string") {
    return fallback;
  }

  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  // Block scheme-relative and obvious URL injection in path
  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return fallback;
  }

  return trimmed.length > 2048 ? fallback : trimmed;
}
