"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";

export default function Chapter01() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const dialogues = useGameStore((s) => s.chapter01Dialogues);

  const current = dialogues[index];
  const isLast = index === dialogues.length - 1;

  function handleNext() {
    if (isLast) {
      router.push("/explore");
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-amber-100 relative overflow-hidden">
      {/* 背景：糖果屋外觀（CSS 佔位） */}
      <div className="flex-1 flex items-end justify-between px-8 pb-4">
        {/* 糖果屋外觀色塊 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="w-72 h-64 bg-pink-300 border-4 border-pink-500 rounded-t-3xl flex flex-col items-center justify-center gap-2 shadow-lg">
            <span className="text-6xl">🏠</span>
            <span className="text-pink-700 font-bold text-lg">糖果屋</span>
            <div className="flex gap-2 mt-2">
              {["🍭","🍬","🍰","🍫","🧁"].map((c,i) => (
                <span key={i} className="text-xl">{c}</span>
              ))}
            </div>
          </div>
        </div>

        {/* 老婆婆角色（右側） */}
        <div className="absolute right-8 bottom-32 flex flex-col items-center">
          <div className="w-24 h-36 bg-gray-300 border-2 border-gray-500 rounded-t-full flex items-center justify-center">
            <span className="text-4xl">👵</span>
          </div>
          <span className="text-xs text-gray-600 mt-1">老婆婆</span>
        </div>
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
