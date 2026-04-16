
import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8">서비스 소개</h1>

            <div className="prose prose-slate max-w-none space-y-8 text-muted-foreground">
                <section>
                    <h2 className="text-2xl font-bold text-foreground mb-4">제네시스 주식 리포트: 데이터 기반 한국 증시 인사이트</h2>
                    <p className="text-lg leading-relaxed">
                        제네시스 주식 리포트는 방대한 시장 데이터를 정밀하게 분석하여 투자자들에게 명확하고 신뢰할 수 있는 정보를 제공하기 위해 탄생한 플랫폼입니다. 복잡한 차트와 수치 속에 숨겨진 시장의 흐름을 읽어내고, 개인 투자자들이 보다 현명한 의사결정을 내릴 수 있도록 돕습니다.
                    </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
                    <div className="p-6 rounded-xl bg-accent/50 border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-2">실시간 시황 데이터</h3>
                        <p>국내외 핵심 지표와 시장의 주요 흐름을 실시간으로 추적하여 가장 빠르게 전달합니다.</p>
                    </div>
                    <div className="p-6 rounded-xl bg-accent/50 border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-2">심층 종목 리포트</h3>
                        <p>재무제표 분석부터 성장성 평가까지, 다양한 각도에서 종목을 분석한 전문 리포트를 제공합니다.</p>
                    </div>
                </div>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">우리의 미션</h2>
                    <p>
                        정보의 불균형을 해소하고 전업 투자자와 일반 개인 투자자 모두가 데이터에 기반한 투자를 할 수 있는 환경을 만드는 것이 제네시스 주식 리포트의 목표입니다.
                    </p>
                </section>

                <section className="bg-primary/5 p-8 rounded-2xl border border-primary/20 text-center">
                    <h2 className="text-xl font-semibold text-primary mb-4">연락처 및 피드백</h2>
                    <p className="mb-6">서비스 이용 관련 제안이나 비즈니스 문의는 전용 문의 폼을 이용해 주세요.</p>
                    <Link
                        href="/contact"
                        className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors"
                    >
                        문의하기 페이지로 이동
                    </Link>
                </section>
            </div>
        </div>
    );
}
