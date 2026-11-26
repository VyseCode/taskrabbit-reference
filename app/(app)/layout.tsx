import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { getSessionUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <Navbar user={{ name: user.name, role: user.role, avatarUrl: user.avatarUrl }} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
