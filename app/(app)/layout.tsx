import { NavigationShell } from "@/components/NavigationShell";
import { getShellUser } from "@/lib/auth/session";

export default async function AppChromeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const shellUser = await getShellUser();

  return <NavigationShell user={shellUser}>{children}</NavigationShell>;
}
