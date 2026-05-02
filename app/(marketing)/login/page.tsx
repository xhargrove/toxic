import Link from "next/link";

import { sanitizeNextPath } from "@/lib/auth/redirect-path";

import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = sanitizeNextPath(next);
  const signUpHref =
    safeNext !== "/home" ? `/sign-up?next=${encodeURIComponent(safeNext)}` : "/sign-up";

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          New here?{" "}
          <Link href={signUpHref} className="text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
      <LoginForm defaultNext={safeNext} />
    </section>
  );
}
