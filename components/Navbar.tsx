"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import {
  GridIcon,
  LogoutIcon,
  MarketIcon,
  PeopleIcon,
  TaskIcon,
} from "@/components/Icons";

type NavbarProps = {
  user: { name: string; role: string; avatarUrl: string };
};

const links = [
  { href: "/marketplace", label: "Marketplace", Icon: MarketIcon },
  { href: "/tasks", label: "Tasks", Icon: TaskIcon },
  { href: "/taskers", label: "Taskers", Icon: PeopleIcon },
  { href: "/categories", label: "Categories", Icon: GridIcon },
  { href: "/dashboard", label: "Dashboard", Icon: GridIcon },
];

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/marketplace" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#177245] text-base font-bold text-white">
            T
          </span>
          <span className="hidden text-base font-bold tracking-tight text-slate-900 sm:inline">
            Taskly
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-w-14 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors sm:min-w-20 sm:flex-row sm:gap-2 sm:text-sm ${
                  active
                    ? "bg-[#e8f4ed] text-[#177245]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}

          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Account menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-full border border-transparent p-0.5 hover:border-slate-200"
            >
              <Avatar name={user.name} size="sm" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs capitalize text-slate-500">{user.role} account</p>
                </div>
                <Link
                  href="/taskers/me"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  My tasker profile
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50"
                >
                  <LogoutIcon className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
