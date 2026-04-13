
"use client";

import { Search, UserCircle, Menu } from "lucide-react";
import { useState } from "react";
import { useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";

export function Navbar() {
    const [searchQuery, setSearchQuery] = useState("");
    const { toggle, isOpen } = useSidebar();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim() !== "") {
            const query = searchQuery.trim();
            // 종목 코드(6자리 숫자)인 경우 네이버 증권 종목 페이지로 바로 이동
            if (/^\d{6}$/.test(query)) {
                window.open(`https://finance.naver.com/item/main.naver?code=${query}`, "_blank");
            } else {
                // 한글 종목명인 경우 네이버 통합검색(주가)으로 이동하여 인코딩(EUC-KR) 깨짐 및 404 방지
                window.open(`https://search.naver.com/search.naver?query=${encodeURIComponent(query + " 주가")}`, "_blank");
            }
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 md:px-8 backdrop-blur transition-all">
            <div className="flex items-center space-x-4 flex-1">
                <button 
                    onClick={toggle}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/30 hover:bg-accent text-foreground shadow-sm hover:shadow transition-all"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="h-6 w-6" />
                </button>
                
                {/* 로고 추가 (사이드바가 닫혔을 때나 모바일에서 유용) */}
                <div className={cn(
                    "items-center gap-2 cursor-pointer group transition-all",
                    isOpen ? "lg:hidden flex" : "flex"
                )} onClick={() => window.location.href = '/'}>
                    <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <span className="font-black text-[12px] text-background italic">GR</span>
                    </div>
                    <span className="text-lg font-bold tracking-tighter text-foreground hidden sm:block">
                        Genesis <span className="text-primary">Report</span>
                    </span>
                </div>

                <div className="flex w-full max-w-xl items-center ml-2">
                    <div className="relative w-full group">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="block w-full rounded-2xl border border-border bg-background/50 py-2.5 pl-10 pr-4 text-sm focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/70"
                            placeholder="종목명, 코드 또는 테마 검색..."
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="hidden md:flex flex-col items-end mr-2 text-right">
                    <span className="text-xs font-bold text-foreground tracking-tight underline decoration-primary/30 underline-offset-4">운영자 모드</span>
                    <span className="text-[10px] text-muted-foreground flex items-center mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                        시스템 가동중
                    </span>
                </div>
                <button className="rounded-full p-0.5 border-2 border-transparent hover:border-primary/20 hover:scale-105 transition-all">
                    <UserCircle className="h-9 w-9 text-muted-foreground/80 hover:text-primary" />
                </button>
            </div>
        </header>
    );
}
