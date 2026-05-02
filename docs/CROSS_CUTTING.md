# Cross-cutting

## Middleware vs proxy (Next.js 16)

The app uses root **`middleware.ts`** delegating to **`lib/auth/middleware.ts`**. Next 16 may log deprecation in favor of **`proxy.ts`**. **Do not** run both unless intentional — pick one pattern per [Next.js middleware/proxy docs](https://nextjs.org/docs/messages/middleware-to-proxy).

**`updateSession`** forwards **`x-pathname`** on the request so server layouts can resolve **`returnPath`** for **`requireDbUser`** / **`requireCompleteProfile`** (see **`docs/ONBOARDING.md`**).

## Verification

See **`docs/VERIFICATION.md`**.

## CI

**`.github/workflows/ci.yml`** runs lint, typecheck, test (stub), build.
