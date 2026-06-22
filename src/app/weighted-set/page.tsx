"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Chatbox from "@/components/Chatbox";
import WeightedSetMenu from "@/components/WeightedSetMenu";
import { script } from "./script";

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

  function handleSkipVideo() {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.muted = true;
    }
    setVideoEnded(true);
  }

  function handleSkipNarration() {
    setShowMenu(true);
  }

  const videoHidden = !videoStarted || videoEnded;

  return (
    <div className="flex justify-center items-center w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="relative w-full h-full">
        <div className={showMenu ? "hidden" : "w-full h-full"}>
          <video
            ref={videoRef}
            src="/weighted/nemo-scene.mp4"
            onEnded={() => setVideoEnded(true)}
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
              onClick={handleSkipVideo}
              className="absolute bottom-4 right-4 z-10 bg-black/60 text-white px-6 py-2 rounded-lg text-xl hover:bg-black/80 transition-colors"
              style={{ fontFamily: '"Findet-Nemo"' }}
            >
              Skip
            </button>
          )}

          {videoEnded && (
            <div className="relative w-full h-full">
              <Image
                className="object-contain object-center"
                src="/weighted/nemo-scene.jpg"
                alt="Nemo: Recapturados"
                fill
                sizes="100vw"
                priority
              />
              <h1 className="text-shadow-lg absolute top-3 left-1/2 -translate-x-1/2 text-white text-5xl font-bold text-center font-[Findet-Nemo]">
                Nemo: Recapturados
              </h1>
              <Chatbox
                pages={script}
                enabled={videoEnded && !showMenu}
                onComplete={handleSkipNarration}
              />
              <button
                onClick={handleSkipNarration}
                className="absolute bottom-4 right-4 z-20 bg-black/60 text-white px-6 py-2 rounded-lg text-xl hover:bg-black/80 transition-colors"
                style={{ fontFamily: '"Findet-Nemo"' }}
              >
                Skip
              </button>
            </div>
          )}
        </div>

        {showMenu && <WeightedSetMenu audioPath="/weighted/nemo-song.ogg" />}
      </div>
    </div>
  );
}
