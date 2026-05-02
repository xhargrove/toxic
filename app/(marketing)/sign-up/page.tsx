import Link from "next/link";

import { sanitizeNextPath } from "@/lib/auth/redirect-path";

import { SignUpForm } from "./sign-up-form";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = sanitizeNextPath(next);
  const loginHref =
    safeNext !== "/home" ? `/login?next=${encodeURIComponent(safeNext)}` : "/login";

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Already have an account?{" "}
          <Link href={loginHref} className="text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
      <SignUpForm defaultNext={safeNext} />
    </section>
  );
}
