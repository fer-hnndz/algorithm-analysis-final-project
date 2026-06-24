"use client";

import { useState } from "react";

/**
 * Fondo de video a pantalla completa para la interfaz de pruebas.
 * Reproduce /sat/kitchen-bg.mp4 en loop, silenciado (requisito para autoplay)
 * y fijo detrás del contenido. Si el archivo falla, queda un gradiente cálido.
 */
export function BackgroundVideo() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-stone-950 via-amber-950 to-red-950">
      {!failed && (
        <video
          className="h-full w-full object-cover"
          src="/sat/kitchen-bg.mp4"
          autoPlay
          loop
          muted
          playsInline
          onError={() => setFailed(true)}
        />
      )}
      {/* Capas de oscurecido para legibilidad e integración cinematográfica. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 25% 20%, rgba(255,170,70,0.14), transparent 55%), radial-gradient(circle at 80% 85%, rgba(200,50,40,0.16), transparent 55%)",
        }}
      />
      {/* Viñeta. */}
      <div
        className="absolute inset-0"
        style={{ boxShadow: "inset 0 0 260px 70px rgba(0,0,0,0.7)" }}
      />
    </div>
  );
}
