"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Page } from "@/lib/paginate";

const TYPE_SPEED_MS = 60; // ~0.06s per char for Pokemon style

interface TypewriterOptions {
  onType?: (char: string) => void; // called once per naturally typed char
  enabled?: boolean; // hold off typing until true (e.g. audio is ready)
}

// Drives the page-by-page typewriter: types a page out char by char, exposes
// what to render, and advances to the next page/message on `advance()`.
export function useTypewriter(
  pages: Page[],
  { onType, enabled = true }: TypewriterOptions = {}
) {
  const [pageIndex, setPageIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const page = pages[pageIndex] ?? { text: "", lastOfMessage: true };
  const text = page.text;

  // Reset during render when the active page changes (no effect needed).
  const [typedText, setTypedText] = useState(text);
  if (typedText !== text) {
    setTypedText(text);
    setCharCount(0);
  }

  // Type out one char at a time until the full page is shown.
  useEffect(() => {
    if (!enabled || !text) return;

    const interval = setInterval(() => {
      setCharCount((count) => {
        if (count >= text.length) {
          clearInterval(interval);
          return count;
        }
        return count + 1;
      });
    }, TYPE_SPEED_MS);

    return () => clearInterval(interval);
  }, [text, enabled]);

  // Fire onType only on the natural one-char step (not the skip-to-end jump or
  // the reset to 0 when the page changes). A ref keeps the effect off onType's
  // identity.
  const onTypeRef = useRef(onType);
  onTypeRef.current = onType;
  const prevCharCount = useRef(0);
  useEffect(() => {
    if (charCount - prevCharCount.current === 1 && charCount <= text.length) {
      onTypeRef.current?.(text.charAt(charCount - 1));
    }
    prevCharCount.current = charCount;
  }, [charCount, text]);

  // First reveal the rest of the page, then advance to the next one. Each
  // setState is kept independent (no nesting) so updaters stay pure.
  const advance = useCallback(() => {
    if (charCount < text.length) {
      setCharCount(text.length); // finish typing the current page first
    } else if (pageIndex < pages.length - 1) {
      setPageIndex((i) => i + 1); // page change resets charCount during render
    }
  }, [charCount, text.length, pageIndex, pages.length]);

  return {
    display: text.slice(0, charCount),
    done: charCount >= text.length,
    hasNext: pageIndex < pages.length - 1,
    // When the current page is the last of its message, the next press jumps to
    // a brand new message; otherwise it just continues the current one.
    nextIsNewMessage: page.lastOfMessage,
    advance,
  };
}
