"use client";

import { useCallback, useEffect } from "react";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useTypingSound } from "@/hooks/useTypingSound";
import type { Page } from "@/lib/paginate";

interface ChatboxProps {
  pages: Page[];
  enabled: boolean;
}

export default function Chatbox({ pages, enabled }: ChatboxProps) {
  const { playBlip, ready } = useTypingSound();
  const { display, done, advance } = useTypewriter(pages, {
    onType: playBlip,
    enabled: enabled && ready,
  });

  const handleAdvance = useCallback(() => {
    if (!enabled) return;
    advance();
  }, [advance, enabled]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleAdvance]);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 p-6 cursor-pointer z-20"
      onClick={handleAdvance}
    >
      <div className="bg-black/70 border-2 border-white/40 rounded-lg p-5 min-h-[90px]">
        <p
          className="text-white text-xl leading-relaxed"
          style={{ fontFamily: '"Findet-Nemo"' }}
        >
          {display}
          {done && (
            <span className="inline-block animate-pulse ml-2">▼</span>
          )}
        </p>
      </div>
    </div>
  );
}
