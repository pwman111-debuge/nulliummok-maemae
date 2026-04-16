import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
    const lastUpdated = "2026년 3월 14일";

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>

            <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground">
                <p>
                    제네시스 주식 리포트(이하 '회사' 또는 '서비스')는 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령상의 개인정보보호 규정을 준수하며, 이용자의 개인정보 보호를 최우선으로 생각합니다.
                </p>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">1. 수집하는 개인정보의 항목</h2>
                    <p>본 서비스는 별도의 회원가입 없이 이용이 가능하며, 기본적인 서비스 이용 과정에서 다음과 같은 정보들이 자동 생성되어 수집될 수 있습니다.</p>
                    <ul className="list-disc pl-5">
                        <li>IP 주소, 쿠키, 방문 일시, 서비스 이용 기록, 기기 정보</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">2. 개인정보의 수집 및 이용 목적</h2>
                    <p>회사는 수집한 정보를 다음과 같은 목적을 위해 활용합니다.</p>
                    <ul className="list-disc pl-5">
                        <li>서비스 제공 및 콘텐츠 개인화</li>
                        <li>접속 빈도 파악 및 서비스 이용 통계 분석</li>
                        <li>구글 애드센스 등 광고 게재 및 맞춤형 광고 제공</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">3. 쿠키(Cookie)의 운용 및 거부</h2>
                    <p>본 서비스는 이용자에게 개인화된 광고와 서비스를 제공하기 위해 쿠키를 사용합니다. 특히 구글(Google)을 포함한 제3자 제공업체는 쿠키를 사용하여 이용자의 이전 방문을 바탕으로 광고를 게재합니다.</p>
                    <p>이용자는 웹 브라우저의 설정을 통해 쿠키 저장을 거부할 수 있습니다. 다만, 쿠키 설치를 거부할 경우 일부 서비스 이용에 어려움이 있을 수 있습니다.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">4. 제3자 광고 플랫폼 이용</h2>
                    <p>본 서비스는 구글 애드센스(Google AdSense)를 이용하며, 구글의 개인정보 보호 및 약관에 따릅니다. 이용자는 구글의
                        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                            광고 설정
                        </a>을 통해 맞춤형 광고를 선택 해제할 수 있습니다.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-foreground mb-3">5. 개인정보 보호책임자</h2>
                    <p>서비스 이용 중 발생하는 모든 개인정보 보호 관련 민원은 아래 전용 문의 폼을 통해 문의해 주시기 바랍니다.</p>
                    <p className="mt-2">
                        <Link href="/contact" className="text-primary font-bold hover:underline">
                            문의하기 페이지 바로가기
                        </Link>
                    </p>
                </section>

                <p className="pt-8 border-t border-border">
                    최종 수정일: {lastUpdated}
                </p>
            </div>
        </div>
    );
}
