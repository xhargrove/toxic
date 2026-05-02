import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

export type ShellUser = {
  email: string;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

/**
 * Current Supabase Auth user from cookies, or null.
 */
export async function getOptionalAuthUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Profile fields for the shell: prefers Prisma row linked by `supabaseUserId`, falls back to session email.
 */
export async function getShellUser(): Promise<ShellUser | null> {
  const authUser = await getOptionalAuthUser();
  if (!authUser?.email) {
    return null;
  }

  const row = await prisma.user.findUnique({
    where: { supabaseUserId: authUser.id },
    select: { email: true, username: true, displayName: true, avatarUrl: true },
  });

  if (row) {
    return row;
  }

  return {
    email: authUser.email,
    username: null,
    displayName: null,
    avatarUrl: null,
  };
}
