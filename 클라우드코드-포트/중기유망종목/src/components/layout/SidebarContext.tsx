
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
    isOpen: boolean;
    toggle: () => void;
    setIsOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    // 초기값을 false로 설정하여 모바일 하이드레이션 오류 방지
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    const toggle = () => setIsOpen((prev: boolean) => !prev);

    useEffect(() => {
        setMounted(true);

        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsOpen(false);
            } else {
                setIsOpen(true);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <SidebarContext.Provider value={{ isOpen, toggle, setIsOpen }}>
            {/* 마운트 전에는 보이지 않게 처리하여 하이드레이션 불일치 방지 */}
            <div
                className={mounted ? "" : "invisible"}
                style={mounted ? { display: 'contents' } : { display: 'block' }}
            >
                {children}
            </div>
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
