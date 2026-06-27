import type { Metadata } from "next";
import { SatExperience } from "@/components/sat/SatExperience";

export const metadata: Metadata = {
  title: "La Sopa Perfecta de Linguini — SAT (DPLL)",
  description:
    "Experiencia educativa de satisfacibilidad booleana (SAT) en FNC resuelta con DPLL, con temática Ratatouille.",
};

/**
 * Página SAT. El fondo de la interfaz lo provee <BackgroundVideo /> (un video
 * en loop fijo detrás del contenido), por lo que este <main> debe ser
 * transparente para no taparlo.
 */
export default function SatPage() {
  return (
    <main className="relative min-h-screen w-full">
      <SatExperience />
    </main>
  );
}
