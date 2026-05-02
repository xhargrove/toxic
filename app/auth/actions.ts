"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { sanitizeNextPath } from "@/lib/auth/redirect-path";
import { syncUserFromSupabase } from "@/lib/auth/sync-user";
import { findAppUserByUsername } from "@/lib/db/app-user";
import { prisma } from "@/lib/db/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, signUpSchema, usernameSchema } from "@/lib/validation/auth";

export type AuthFinalizeState = { error?: string } | null;

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  success?: boolean;
  message?: string;
} | null;

function mapPrismaUserError(e: unknown): string | null {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return "That email or username is already taken.";
  }
  return null;
}

/**
 * Call after browser `signInWithPassword` / `signUp` so cookies are written; syncs Prisma `User`, then redirects.
 */
export async function finalizeAuthSession(nextPath: string): Promise<AuthFinalizeState> {
  const next = sanitizeNextPath(nextPath);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Session not available. Try signing in again." };
  }

  try {
    await syncUserFromSupabase(user);
  } catch (e) {
    const mapped = mapPrismaUserError(e);
    if (mapped) {
      return { error: mapped };
    }
    throw e;
  }

  redirect(next);
}

export type UsernameAvailabilityState = { available: true } | { available: false; error: string };

/**
 * Email/password sign-in on the server so Supabase session cookies are set on the response.
 * (Browser-only sign-in + `finalizeAuthSession` races: the server action often ran before cookies existed.)
 */
export async function signInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Sign-in failed." };
  }

  try {
    await syncUserFromSupabase(data.user);
  } catch (e) {
    const mapped = mapPrismaUserError(e);
    if (mapped) {
      return { error: mapped };
    }
    throw e;
  }

  const next = sanitizeNextPath(formData.get("next")?.toString());
  redirect(next);
}

export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const usernameTaken = await findAppUserByUsername(parsed.data.username);
  if (usernameTaken) {
    return {
      error: "Username is already taken.",
      fieldErrors: { username: ["Username is already taken."] },
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: parsed.data.username },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session && data.user) {
    try {
      await syncUserFromSupabase(data.user);
    } catch (e) {
      const mapped = mapPrismaUserError(e);
      if (mapped) {
        return { error: mapped };
      }
      throw e;
    }
    const next = sanitizeNextPath(formData.get("next")?.toString());
    redirect(next);
  }

  return {
    success: true,
    message:
      "Check your email for a confirmation link. After confirming, you can sign in.",
  };
}

export async function checkUsernameAvailability(username: string): Promise<UsernameAvailabilityState> {
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) {
    return {
      available: false,
      error: parsed.error.issues[0]?.message ?? "Choose a valid username.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { username: parsed.data },
    select: { id: true },
  });

  if (existing) {
    return { available: false, error: "That username is already taken." };
  }

  return { available: true };
}
