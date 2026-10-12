"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, History, Settings, Mail } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "New Campaign", href: "/campaigns/new", icon: PlusCircle },
  { label: "Campaign History", href: "/campaigns/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen p-4 select-none">
      <div className="flex items-center gap-2.5 px-3 py-4 mb-4 border-b border-slate-100">
        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-sm">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-900 tracking-tight leading-tight">
            Gmail Bulk Sender
          </h1>
          <p className="text-xs text-slate-500">1-by-1 Dispatcher</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 px-3 space-y-1.5">
        <p className="text-[11px] font-medium text-slate-500">Official Gmail API Integration</p>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <Link href="/privacy" className="hover:underline hover:text-blue-600 transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:underline hover:text-blue-600 transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </aside>
  );
}
