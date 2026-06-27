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
    <div className="relative h-full w-full max-w-[360px] mx-auto" style={{ isolation: 'isolate' }}>
      
      {/* Burbuja de diálogo */}
      
<div className="absolute z-20" style={{ top: '26%', right: '-25px', maxWidth: 180 }}>
  <div
    className="rounded-2xl px-4 py-3 shadow-2xl relative"
    style={{ background: 'white', border: '3px solid #e8a830' }}
  >
    <p className="text-xs font-bold leading-snug text-center" style={{ color: '#3d1f0a' }}>
      {GUIDE_MESSAGES[messageIdx]}
    </p>
    
    {/* Triangulito de la burbuja */}
    <div
      className="absolute"
      style={{
        left: -13,
        top: '50%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderRight: '13px solid white',
      }}
    />
  </div>
      </div>

      {/* Imagen de Andy */}
      <img
        src="/knapsack_assets/Andy.png"
        alt="Andy"
        className="absolute w-full max-w-[280px] object-contain object-bottom drop-shadow-2xl"
        style={{
          mixBlendMode: 'multiply',
          height: '100%',
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
