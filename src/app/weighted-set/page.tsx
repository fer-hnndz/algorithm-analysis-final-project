"use server";

import Image from "next/image";

export default async function WeightedSetPage() {
  return (
    <div className="flex justify-center items-center w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="relative w-max h-max overflow-hidden">
        <Image
          src="/weighted/scene.png"
          alt="Theme Background"
          width={1320}
          height={800}
          className="z-0 object-fill scale-105 render-[pixelated]"
        />

        <Image
          src="/weighted/chatbox.webp"
          alt="Chat Box"
          width={400}
          height={200}
          className="z-10 absolute top-[18%] left-[50%] translate-x-[-50%] translate-y-[-50%] render-[pixelated]"
        />
      </div>
    </div>
  );
}
