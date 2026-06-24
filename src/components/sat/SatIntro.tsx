"use client";

import { SkipForward, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SatIntroProps = {
  /** Se llama cuando la intro termina o el usuario presiona "Saltar". */
  onFinish: () => void;
};

/**
 * Intro a pantalla completa. Reproduce /sat/intro-linguini-soup.mp4 CON audio.
 * Como se llega aquí tras el click en "Start" (gesto de usuario), el navegador
 * permite el sonido. Si el navegador igual bloquea el play con audio, se
 * reintenta en silencio para que la intro no se quede congelada.
 *
 * - Si el video termina solo (onEnded) -> continúa al planteamiento del problema.
 * - Si el usuario presiona "Saltar intro" -> continúa de inmediato.
 * - Si el archivo no existe -> se salta automáticamente sin romper el flujo.
 */
export function SatIntro({ onFinish }: SatIntroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {
      // El navegador bloqueó el audio: reintentar silenciado.
      video.muted = true;
      setMuted(true);
      video.play().catch(() => {
        // Ni así se pudo reproducir: continuar al siguiente paso.
        onFinish();
      });
    });
  }, [onFinish]);

  const unmute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    void video.play().catch(() => undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src="/sat/intro-linguini-soup.mp4"
        autoPlay
        playsInline
        onEnded={onFinish}
        onError={onFinish}
      />

      {muted && (
        <button
          type="button"
          onClick={unmute}
          className="absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-2 rounded-full bg-amber-500/90 px-5 py-2 text-sm font-bold text-stone-900 shadow-lg hover:bg-amber-400"
        >
          <VolumeX className="h-4 w-4" aria-hidden />
          Tocá para activar el sonido
        </button>
      )}

      <button
        type="button"
        onClick={onFinish}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/40 bg-black/50 px-8 py-3 text-base font-bold text-white backdrop-blur transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70"
      >
        Saltar intro
        <SkipForward className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
