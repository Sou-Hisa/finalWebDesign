"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-amber-800 text-gray-100 border border-gray-500 text-xs font-ui ${className}`}>
      {label}
    </div>
  );
}

export default function Chapter01() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const dialogues = useGameStore((s) => s.chapter01Dialogues);

  const current = dialogues[index];
  const isLast = index === dialogues.length - 1;

  function handleNext() {
    if (isLast) router.push("/explore");
    else setIndex((i) => i + 1);
  }

  return (
    <div className="w-full h-screen flex flex-col ">
      {/* 主場景 */}
      <div className="flex-1 relative bg-black">
        <div
          className="
            absolute inset-0
            bg-[url('/images/ch01_bg.png')]
            bg-auto
            bg-center
            bg-no-repeat
          "
          style={{
            backgroundSize: "auto 100%",
          }}
        />
        <div className="absolute inset-0 bg-black/55" />
        {/* 老婆婆立繪 */}
        <Placeholder label="[老婆婆 立繪]" className="absolute bottom-25 right-30 w-28 h-44" />
      </div>

      {/* 對話框 */}
        <DialogueBox
          character={current.character}
          text={current.text}
          onNext={handleNext}
          isLast={isLast}
          lastLabel="進入屋內"
        />
    </div>
  );
}
