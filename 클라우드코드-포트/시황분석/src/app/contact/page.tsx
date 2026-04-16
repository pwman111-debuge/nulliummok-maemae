
"use client";

import React, { useState } from 'react';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        
        const formData = new FormData(e.currentTarget);
        formData.append("access_key", "6db6d5a4-e3af-4848-966d-728af57b5c24");

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
            } else {
                console.error("Error", data);
                setStatus('error');
            }
        } catch (error) {
            console.error("Error", error);
            setStatus('error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-4">문의하기</h1>
                <p className="text-muted-foreground">
                    서비스 이용 관련 피드백이나 비즈니스 제안이 있으시면 아래 폼을 통해 보내주세요.
                </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-border p-8 md:p-12">
                {status === 'success' ? (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">메시지가 전송되었습니다!</h2>
                        <p className="text-muted-foreground mb-8">소중한 의견 주셔서 감사합니다. 확인 후 빠른 시일 내에 답변 드리겠습니다.</p>
                        <button 
                            onClick={() => setStatus('idle')}
                            className="text-primary font-medium hover:underline"
                        >
                            새로운 문의 보내기
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 스팸 방지를 위한 허니팟 필드 (사용자에게는 보이지 않음) */}
                        <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2">이름</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="성함을 입력해주세요"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">이메일 주소</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="답변 받으실 이메일을 입력해주세요"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium mb-2">제목</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="문의 제목을 입력해주세요"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium mb-2">내용</label>
                            <textarea
                                id="message"
                                name="message"
                                rows={6}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                placeholder="궁금하신 내용을 상세히 적어주세요"
                            ></textarea>
                        </div>
                        
                        {status === 'error' && (
                            <p className="text-red-500 text-sm text-center">전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>
                        )}

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'submitting' ? '전송 중...' : '메시지 보내기'}
                            </button>
                        </div>
                        <p className="text-xs text-center text-muted-foreground">
                            보내주신 개인정보는 문의 답변을 위한 목적으로만 사용되며, 관련 법령에 따라 안전하게 보호됩니다.
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
