
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    BarChart3,
    TrendingUp,
    Search,
    BookOpen,
    Calendar,
    LayoutDashboard,
    Zap,
    ClipboardCheck
} from "lucide-react";

const menuItems = [
    { name: "대시보드", href: "/", icon: LayoutDashboard },
    { name: "시황 분석", href: "/market", icon: TrendingUp },
    { name: "마켓 인사이트", href: "/insight", icon: Zap },
    { name: "유망 종목", href: "/picks", icon: Search, isPro: true },
    { name: "투자 성과 리포트", href: "/picks/feedback", icon: ClipboardCheck },
    { name: "종목 리포트", href: "/analysis", icon: BarChart3 },
    { name: "경제 캘린더", href: "/calendar", icon: Calendar },
    { name: "투자 교육", href: "/education", icon: BookOpen },
];

import { useSidebar } from "./SidebarContext";
import { X } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();
    const { isOpen, setIsOpen } = useSidebar();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-white transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex h-full flex-col px-3 py-4 relative">
                    {/* Close button for mobile */}
                    <button
                        className="absolute right-4 top-4 rounded-md p-1 lg:hidden hover:bg-accent"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="mb-10 flex items-center px-2">
                        <div className="mr-3 h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <span className="font-bold text-background">GR</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            Genesis Report
                        </span>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <item.icon className={cn("mr-3 h-5 w-5", isActive ? "" : "text-muted-foreground group-hover:text-accent-foreground")} />
                                    <span className="flex-1">{item.name}</span>
                                    {item.isPro && (
                                        <span className={cn(
                                            "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold shadow-sm transition-all animate-pulse",
                                            isActive
                                                ? "bg-white/20 text-white border border-white/30"
                                                : "bg-amber-100 text-amber-600 border border-amber-200"
                                        )}>
                                            PRO
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto border-t border-border pt-4">
                        <p className="px-3 py-2 text-[10px] text-muted-foreground text-center">
                            © {new Date().getFullYear()} 제네시스 주식 리포트
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
}
