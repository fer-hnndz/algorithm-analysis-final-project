"use client";

import { useRef, useState } from "react";
import WeightedSetMenu from "@/components/WeightedSetMenu";

export default function WeightedSetPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  function handleStart() {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play();
      setVideoStarted(true);
    }
  }

  function handleEndVideo() {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.muted = true;
    }
    setVideoEnded(true);
    setShowMenu(true);
  }

  const videoHidden = !videoStarted || videoEnded;

  return (
    <div className="flex justify-center items-center w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="relative w-full h-full">
        {!showMenu && (
          <div className="w-full h-full">
            <video
              ref={videoRef}
              src="/weighted/nemo-scene.mp4"
              onEnded={handleEndVideo}
              className={
                videoHidden
                  ? "hidden"
                  : "w-full h-full object-contain object-center"
              }
            />

            {!videoStarted && !videoEnded && (
              <button
                onClick={handleStart}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white px-8 py-4 rounded-lg text-3xl hover:bg-black/80 transition-colors"
                style={{ fontFamily: '"Findet-Nemo"' }}
              >
                START
              </button>
            )}

            {videoStarted && !videoEnded && (
              <button
                onClick={handleEndVideo}
                className="absolute bottom-4 right-4 z-10 bg-black/60 text-white px-6 py-2 rounded-lg text-xl hover:bg-black/80 transition-colors"
                style={{ fontFamily: '"Findet-Nemo"' }}
              >
                Skip
              </button>
            )}
          </div>
        )}

        {showMenu && <WeightedSetMenu audioPath="/weighted/nemo-song.ogg" />}
      </div>
    </div>
  );
}
