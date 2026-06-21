"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";

// A few close notes so the blips have a little texture without being musical.
const BLIP_NOTES = ["C5", "D5", "E5", "G5"];

// Owns a single reusable synth and plays a short blip per character, Pokemon
// style. Browsers block audio until a user gesture, so this hook waits for the
// first one to unlock the AudioContext and reports back via `ready`.
export function useTypingSound() {
  const synthRef = useRef<Tone.Synth | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const synth = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.02 },
      volume: -18,
    }).toDestination();
    synthRef.current = synth;
    return () => {
      synth.dispose();
      synthRef.current = null;
    };
  }, []);

  // Unlock the AudioContext on the first gesture anywhere on the page.
  useEffect(() => {
    const unlock = async () => {
      await Tone.start();
      setReady(true);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const playBlip = useCallback((char: string) => {
    const synth = synthRef.current;
    // Stay silent on spaces and until the AudioContext is unlocked.
    if (!synth || char === " " || Tone.getContext().state !== "running") return;
    const note = BLIP_NOTES[char.toLowerCase().charCodeAt(0) % BLIP_NOTES.length];
    synth.triggerAttackRelease(note, "32n");
  }, []);

  return { playBlip, ready };
}
