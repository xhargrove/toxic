"use client";

import { useState } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { checkUsernameAvailability, finalizeAuthSession } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const inputClass =
  "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

export function SignUpForm({ defaultNext }: { defaultNext?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const username = String(fd.get("username") ?? "");

    try {
      const supabase = createSupabaseBrowserClient();
      const availability = await checkUsernameAvailability(username);
      if (!availability.available) {
        setError(availability.error);
        setPending(false);
        return;
      }

      const { data, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (signErr) {
        setError(signErr.message);
        setPending(false);
        return;
      }

      if (data.session && data.user) {
        const fin = await finalizeAuthSession(defaultNext ?? "");
        if (fin?.error) {
          await supabase.auth.signOut();
          setError(fin.error);
          setPending(false);
        }
        return;
      }

      setInfo(
        "Check your email for a confirmation link. After confirming, you can sign in."
      );
      setPending(false);
    } catch (err) {
      if (isRedirectError(err)) {
        throw err;
      }
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={24}
          pattern="^[a-zA-Z0-9_]+$"
          className={inputClass}
        />
        <p className="text-muted-foreground text-xs">Letters, numbers, and underscores only.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={inputClass}
        />
        <p className="text-muted-foreground text-xs">At least 8 characters.</p>
      </div>

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {info ? <p className="text-muted-foreground text-sm">{info}</p> : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
