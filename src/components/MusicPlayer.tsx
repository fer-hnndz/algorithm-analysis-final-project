"use client";

import { useEffect, useRef, useState } from "react";

interface MusicPlayerProps {
  audioPath: string;
  playing: boolean;
  className?: string;
}

export default function MusicPlayer({ audioPath, playing, className = "" }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showSlider, setShowSlider] = useState(false);
  const [volume, setVolume] = useState(0.35);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }

  // Set initial volume on mount
  useEffect(() => {
    audioRef.current!.volume = volume;
  }, []);

  return (
    <>
      <audio ref={audioRef} src={audioPath} loop />
      <div className={`absolute top-4 right-4 flex items-center gap-2 z-10 ${className}`}>
        {showSlider && (
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 accent-white cursor-pointer"
          />
        )}
        <button
          onClick={() => setShowSlider(!showSlider)}
          className="bg-black/60 text-white p-2 rounded-lg hover:bg-black/80 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        </button>
      </div>
    </>
  );
}
