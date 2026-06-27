"use client"

import { useEffect, useState } from 'react';

interface AndyGuideProps {
  initialMessage?: string;
}

const GUIDE_MESSAGES = [
  "¡Hola! me mudare pronto.",
  "¡Ayúdame a elegir qué juguetes empacar!",
  "Reccuerda que mi caja tiene un tamaño límite (W).",
  "¡Elige los mejores juguetes!",
];

export function AndyGuide({ initialMessage }: AndyGuideProps) {
  const [messageIdx, setMessageIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIdx((prev) => (prev + 1) % GUIDE_MESSAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full w-full" style={{ isolation: 'isolate' }}>
      <div className="absolute z-20" style={{ bottom: '70%', left: '60%', maxWidth: 220 }}>
        <div
          className="rounded-2xl px-4 py-3 shadow-2xl"
          style={{ background: 'white', border: '3px solid #e8a830' }}
        >
          <p className="text-sm font-bold leading-snug text-center" style={{ color: '#3d1f0a' }}>
            {GUIDE_MESSAGES[messageIdx]}
          </p>
          <div
            className="absolute"
            style={{
              left: -13,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderRight: '13px solid white',
            }}
          />
        </div>
      </div>

      <img
        src="/knapsack_assets/Andy.png"
        alt="Andy"
        className="absolute object-contain object-bottom drop-shadow-2xl"
        style={{
          mixBlendMode: 'multiply',
          height: 'clamp(500px, 90vh, 1100px)',
          width: 'auto',
          left: '0%',
          bottom: '-2%',
          opacity: 0.95,
        }}
      />
    </div>
  );
}

export function Background() {
  return (
    <div className="absolute inset-0">
      <img
        src="/knapsack_assets/Andy_room_backgorud.jpg"
        alt="Andy's room"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/25" />
    </div>
  );
}
