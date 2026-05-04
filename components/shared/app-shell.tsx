"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Brain,
  CalendarClock,
  ChevronRight,
  HeartHandshake,
  Home,
  Leaf,
  LogOut,
  Settings,
  Sparkles,
  Target,
  WalletCards,
  CheckSquare2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/features/auth/actions";
import { QuickNoteDock } from "@/features/quick-notes/quick-note-dock";
import { cn } from "@/lib/utils/cn";
import type { QuickNoteRow } from "@/types/database";

type AppShellProps = {
  children: React.ReactNode;
  profile: {
    full_name: string | null;
    email: string | null;
  } | null;
  quickNotes: QuickNoteRow[];
};

const navItems = [
  { href: "/app", label: "Tổng quan", icon: Home },
  { href: "/app/tasks", label: "Nhiệm vụ", icon: CheckSquare2 },
  { href: "/app/finance", label: "Tài chính", icon: WalletCards },
  { href: "/app/health", label: "Sức khỏe", icon: Activity },
  { href: "/app/study", label: "Học tập", icon: BookOpen },
  { href: "/app/time", label: "Thời gian", icon: CalendarClock },
  { href: "/app/relationships", label: "Quan hệ", icon: HeartHandshake },
  { href: "/app/emotions", label: "Cảm xúc", icon: Brain },
  { href: "/app/soul", label: "Tâm linh", icon: Leaf },
  { href: "/app/strategy", label: "Chiến lược", icon: Target },
  { href: "/app/energy", label: "Năng lượng", icon: Sparkles },
  { href: "/app/settings", label: "Cài đặt", icon: Settings }
];

function isActivePath(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, profile, quickNotes }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 -z-20 bg-[linear-gradient(180deg,#F7F8FC_0%,#EEF2F8_100%)]" />
      <aside className="fixed left-5 top-5 z-40 hidden h-[calc(100vh-40px)] w-72 flex-col rounded-[28px] border border-border-soft bg-white/70 p-4 shadow-[0_26px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:flex">
        <Link href="/app" className="mb-5 flex items-center gap-3 rounded-[22px] bg-white/70 p-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-white shadow-[0_16px_36px_rgba(91,108,255,0.28)]">
            <Sparkles className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-bold text-text-primary">Life & Work OS</span>
            <span className="block text-xs text-text-secondary">22nd-century cockpit</span>
          </span>
        </Link>

        <nav className="scrollbar-soft min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-semibold transition duration-200",
                  active
                    ? "bg-[image:var(--gradient-primary)] text-white shadow-[0_15px_34px_rgba(91,108,255,0.26)]"
                    : "text-text-secondary hover:bg-white/78 hover:text-text-primary"
                )}
              >
                <span className="flex items-center gap-3">
                  <span className={cn("grid size-8 place-items-center rounded-xl", active ? "bg-white/18" : "bg-white/70 text-primary-indigo")}>
                    <item.icon className="size-4" />
                  </span>
                  {item.label}
                </span>
                {active ? <ChevronRight className="size-4" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-[22px] border border-border-soft bg-white/64 p-3">
          <p className="truncate text-sm font-bold text-text-primary">{profile?.full_name ?? "Người vận hành"}</p>
          <p className="truncate text-xs text-text-secondary">{profile?.email ?? "Không gian cá nhân"}</p>
          <form action={signOutAction} className="mt-3">
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
              <LogOut className="size-4" />
              Đăng xuất
            </Button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-border-soft bg-white/70 px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/app" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-white">
              <Sparkles className="size-5" />
            </span>
            <span className="text-sm font-bold text-text-primary">Life & Work OS</span>
          </Link>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="icon" aria-label="Đăng xuất">
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </header>

      <div className="px-4 pb-28 pt-6 lg:ml-80 lg:px-8 lg:pb-10 lg:pt-8">{children}</div>
      <QuickNoteDock initialNotes={quickNotes} />

      <nav className="fixed bottom-3 left-3 right-3 z-40 grid grid-cols-5 gap-1 rounded-[24px] border border-border-soft bg-white/82 p-2 shadow-[0_22px_70px_rgba(15,23,42,0.15)] backdrop-blur-2xl lg:hidden">
        {navItems.slice(0, 5).map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "grid place-items-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-semibold transition",
                active ? "bg-[image:var(--gradient-primary)] text-white shadow-[0_12px_28px_rgba(91,108,255,0.25)]" : "text-text-secondary"
              )}
            >
              <item.icon className="size-4" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
