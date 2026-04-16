import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_KR } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stockanalysis2.pages.dev"),
  title: {
    default: "제네시스 주식 리포트 | 한국 주식 분석 및 실시간 증시 시황 플랫폼",
    template: "%s | 제네시스 주식 리포트"
  },
  description: "한국 주식시장의 코스피·코스닥 실시간 시황 분석, 유망 종목 리포트, 테마주 발굴 및 투자 전략을 데이터 기반으로 제공하는 전문 정보 플랫폼입니다.",
  keywords: ["주식", "코스피", "코스닥", "주식분석", "시황리포트", "투자전략", "경제지표", "테마주", "국내주식", "제네시스", "주식리포트"],
  openGraph: {
    title: "제네시스 주식 리포트 | 한국 주식 분석 및 실시간 증시 시황 플랫폼",
    description: "실시간 시황 분석부터 종목 리포트, 테마주 발굴까지. 명확한 투자 인사이트를 확인하세요.",
    url: "https://stockanalysis2.pages.dev",
    siteName: "제네시스 주식 리포트",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "제네시스 주식 리포트 - 한국 주식 분석 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "제네시스 주식 리포트 | 한국 주식 분석 및 실시간 증시 시황 플랫폼",
    description: "데이터 기반의 명확한 투자 인사이트, 실시간 시황 분석 및 국내 종목 리포트",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  appleWebApp: {
    capable: true,
    title: "제네시스",
    statusBarStyle: "default",
  },
  verification: {
    google: "Qq9Sl-g4NINDCZEPLXqJXe7a_S9CcNaxs3RdwtR70ts",
  },
  other: {
    "google-adsense-account": "ca-pub-5479680289617146"
  }
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "제네시스 주식 리포트",
  "url": "https://stockanalysis2.pages.dev",
  "description": "한국 주식시장의 실시간 시황 분석 및 종목 리포트 플랫폼",
  "publisher": {
    "@type": "Organization",
    "name": "제네시스 주식 리포트"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://stockanalysis2.pages.dev/analysis?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};


import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <Script
          id="emergency-reload"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              // 브라우저 캐시 및 서비스 워커로 인한 좀비 페이지 방지
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) { registration.unregister(); }
                });
              }
              
              // JS 청크 로드 실패 시 자동 새로고침 (클라이언트/서버 빌드 불일치 해결)
              window.addEventListener('error', function(e) {
                var msg = e.message || '';
                if (msg.indexOf('ChunkLoadError') !== -1 || msg.indexOf('Failed to fetch') !== -1) {
                  console.warn('Runtime error detected, forcing hard reload...');
                  window.location.reload(true);
                }
              }, true);
            })();
          `}}
        />
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5479680289617146"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${notoSansKR.variable} font-sans antialiased text-foreground min-h-screen`}>
        <GoogleTagManager gtmId="GTM-PCFN2MSK" />
        <GoogleAnalytics gaId="G-SMKJLDBT10" />
        <SidebarProvider>
          <div className="flex bg-background">
            <Sidebar />
            <LayoutWrapper>
              <Navbar />
              <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                {children}
              </main>
              <Footer />
            </LayoutWrapper>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
