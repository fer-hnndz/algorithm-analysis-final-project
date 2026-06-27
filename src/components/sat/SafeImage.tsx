"use client";

import { useState } from "react";

type SafeImageProps = {
  src: string;
  alt: string;
  /** Contenido a mostrar si la imagen no existe o falla (emoji, SVG, etc). */
  fallback: React.ReactNode;
  className?: string;
  /** Clase aplicada al contenedor del fallback. */
  fallbackClassName?: string;
};

/**
 * Imagen tolerante a fallos: intenta cargar `src` y, si el archivo no existe o
 * el navegador no puede mostrarlo, renderiza `fallback` (normalmente un emoji o
 * un gradiente). Así la interfaz nunca se rompe por assets multimedia faltantes.
 */
export function SafeImage({
  src,
  alt,
  fallback,
  className,
  fallbackClassName,
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={fallbackClassName ?? className}
      >
        {fallback}
      </span>
    );
  }

  // <img> nativo (no next/image) para poder capturar onError y usar fallback
  // sin necesitar configurar dominios ni que el archivo exista en build time.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
