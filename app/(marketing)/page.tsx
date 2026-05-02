import Link from "next/link";

export default function LandingPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Toxic</h1>
      <p className="text-muted-foreground">
        Foundation is ready. Start wiring features into routes and shared modules.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link className="underline" href="/home">
          Go to home
        </Link>
        <Link className="underline" href="/login">
          Login
        </Link>
        <Link className="underline" href="/sign-up">
          Sign up
        </Link>
      </div>
    </section>
  );
}
