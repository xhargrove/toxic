"use client";

import { useActionState } from "react";

import { signUpAction, type AuthFormState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

const inputClass =
  "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-base shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

export function SignUpForm({ defaultNext }: { defaultNext?: string }) {
  const [state, action, pending] = useActionState(signUpAction, null as AuthFormState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={defaultNext ?? ""} />

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
          aria-invalid={Boolean(state?.fieldErrors?.username)}
        />
        {state?.fieldErrors?.username?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.username[0]}</p>
        ) : (
          <p className="text-muted-foreground text-xs">Letters, numbers, and underscores only.</p>
        )}
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
          aria-invalid={Boolean(state?.fieldErrors?.email)}
        />
        {state?.fieldErrors?.email?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.email[0]}</p>
        ) : null}
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
          aria-invalid={Boolean(state?.fieldErrors?.password)}
        />
        {state?.fieldErrors?.password?.[0] ? (
          <p className="text-destructive text-xs">{state.fieldErrors.password[0]}</p>
        ) : (
          <p className="text-muted-foreground text-xs">At least 8 characters.</p>
        )}
      </div>

      {state?.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      {state?.success && state.message ? (
        <p className="text-muted-foreground text-sm">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
