
"use client";

import { useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isOpen } = useSidebar();

    return (
        <div 
            className={cn(
                "flex flex-1 flex-col transition-all duration-300 ease-in-out min-h-screen",
                isOpen ? "lg:pl-64" : "pl-0"
            )}
        >
            {children}
        </div>
    );
}
