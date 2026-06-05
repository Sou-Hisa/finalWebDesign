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
    <div className="w-full h-screen flex flex-col bg-amber-900">
      {/* 主場景 */}
      <div className="flex-1 relative">
        {/*<Placeholder label="[糖果屋外觀 背景圖]" className="absolute inset-0" />*/}
        <div
          className="
            absolute inset-0
            bg-[url('/images/bg_ch01.png')]
            bg-cover
            bg-center
            bg-no-repeat
            opacity-40
          "
        />

        {/* 老婆婆立繪 */}
        <Placeholder label="[老婆婆 立繪]" className="absolute bottom-20 right-30 w-28 h-44" />
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
