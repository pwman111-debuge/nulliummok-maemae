'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this exists based on common Next.js patterns, but checking first.

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // try Web Share API (Mobile & some Desktop Browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
        // If abort, do nothing. If error, fallback to clipboard.
      }
    }

    // Fallback: Copy to Clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      alert('링크가 클립보드에 복사되었습니다.');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground hover:text-primary transition-colors",
        className
      )}
      title="공유하기"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-500">복사됨</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>공유</span>
        </>
      )}
    </button>
  );
}
