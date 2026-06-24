"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Efectos de sonido cortos disponibles (rutas en /public/sat/audio). */
const SOUND_PATHS = {
  success: "/sat/audio/success.ogg",
  error: "/sat/audio/error.ogg",
  click: "/sat/audio/click.ogg",
} as const;

const MUSIC_PATH = "/sat/audio/kitchen-theme.ogg";

export type SoundName = keyof typeof SOUND_PATHS;

/**
 * Hook de audio tolerante a fallos para la experiencia SAT.
 *
 * - La música de fondo arranca sola al entrar a la cocina (`startMusic`), que se
 *   llama tras la navegación por la intro/diálogo (hay gesto de usuario, así que
 *   el navegador permite la reproducción). El botón sirve para silenciarla.
 * - Cualquier error (archivo inexistente, navegador que bloquea reproducción)
 *   se ignora silenciosamente: la experiencia sigue funcionando sin audio.
 */
export function useSatSound() {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    if (typeof Audio === "undefined") return;
    const audio = new Audio(MUSIC_PATH);
    audio.loop = true;
    audio.volume = 0.45;
    musicRef.current = audio;
    return () => {
      audio.pause();
      musicRef.current = null;
    };
  }, []);

  const play = useCallback((name: SoundName) => {
    if (typeof Audio === "undefined") return;
    try {
      const audio = new Audio(SOUND_PATHS[name]);
      audio.volume = 0.5;
      // play() devuelve una promesa que puede rechazarse; la ignoramos.
      void audio.play().catch(() => undefined);
    } catch {
      // Sin audio disponible: continuar en silencio.
    }
  }, []);

  /** Arranca la música de fondo (idempotente). Falla en silencio si se bloquea. */
  const startMusic = useCallback(() => {
    const audio = musicRef.current;
    if (!audio) return;
    if (!audio.paused) {
      setMusicOn(true);
      return;
    }
    void audio
      .play()
      .then(() => setMusicOn(true))
      .catch(() => setMusicOn(false));
  }, []);

  /** Alterna entre reproducir y pausar usando el estado real del <audio>. */
  const toggleMusic = useCallback(() => {
    const audio = musicRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio
        .play()
        .then(() => setMusicOn(true))
        .catch(() => setMusicOn(false));
    } else {
      audio.pause();
      setMusicOn(false);
    }
  }, []);

  return { musicOn, startMusic, toggleMusic, play };
}
