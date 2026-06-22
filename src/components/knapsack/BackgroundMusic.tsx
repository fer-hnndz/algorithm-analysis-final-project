"use client"

import { useEffect, useRef, useState } from "react"
import { Music, VolumeX } from "lucide-react"

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio("/knapsack_assets/knapsack_sound/Toy Story - You've Got a Friend in Me (Piano Cover) - Enrique Lázaro.mp3")
    audioRef.current.loop = true
    audioRef.current.volume = 0.2 // Low volume as requested

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(err => {
        console.error("Audio playback failed:", err)
      })
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <button
      onClick={togglePlay}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-all hover:bg-black/70"
      aria-label={isPlaying ? "Mute music" : "Play music"}
    >
      {isPlaying ? (
        <>
          <Music className="h-4 w-4 text-green-400" />
          <span>Music ON</span>
        </>
      ) : (
        <>
          <VolumeX className="h-4 w-4 text-gray-400" />
          <span>Music OFF</span>
        </>
      )}
    </button>
  )
}
