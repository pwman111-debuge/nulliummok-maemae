"use client";

import { useMDXComponent } from 'next-contentlayer2/hooks';
import { cn } from '@/lib/utils';
import { PortfolioChart } from '@/components/dashboard/MainIndexCharts';
import { CustomStockChart } from './CustomStockChart';

const mdxComponents = {
    h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className={cn("mt-10 scroll-m-20 border-b pb-2 text-2xl font-bold tracking-tight first:mt-0 shadow-sm", className)} {...props} />
    ),
    h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className={cn("mt-8 mb-4 scroll-m-20 text-xl font-bold tracking-tight text-primary/90", className)} {...props} />
    ),
    p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p className={cn("leading-7 [&:not(:first-child)]:mt-5 text-zinc-800", className)} {...props} />
    ),
    ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
        <ul className={cn("my-6 ml-6 list-disc space-y-2 text-zinc-800", className)} {...props} />
    ),
    li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
        <li className={cn("mt-2", className)} {...props} />
    ),
    blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
        <blockquote className={cn("mt-6 border-l-4 border-primary pl-6 py-2 italic bg-primary/5 rounded-r-lg shadow-sm text-zinc-700", className)} {...props} />
    ),
    strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
        <strong className={cn("font-bold text-foreground", className)} {...props} />
    ),
    table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
        <div className="w-full mt-6 overflow-x-auto rounded-lg border border-border shadow-sm">
            <table className={cn("inline-block min-w-full mb-0 align-middle", className)} {...props} />
        </div>
    ),
    th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
        <th className={cn("border-b border-border bg-muted/50 px-4 py-3 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right shadow-sm", className)} {...props} />
    ),
    td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
        <td className={cn("border-b border-border px-4 py-3 text-left [&[align=center]]:text-center [&[align=right]]:text-right", className)} {...props} />
    ),
    PortfolioChart: (props: any) => (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm overflow-hidden my-6">
            <h3 className="text-sm font-bold text-muted-foreground mb-4 px-2">{props.title}</h3>
            <PortfolioChart {...props} />
        </div>
    ),
    StockChart: CustomStockChart,
};

interface MdxWrapperProps {
    code: string;
}

export function MdxWrapper({ code }: MdxWrapperProps) {
    const Component = useMDXComponent(code);
    return <Component components={mdxComponents} />;
}
