"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";

export default function Chapter00() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const dialogues = useGameStore((s) => s.chapter00Dialogues);

  const current = dialogues[index];
  const isLast = index === dialogues.length - 1;

  function handleNext() {
    if (isLast) {
      router.push("/chapter01");
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-green-950 relative overflow-hidden">
      {/* 背景：森林深處，遠處看到糖果屋 */}
      <div className="flex-1 flex items-end justify-between px-8 pb-4 relative">
        {/* 森林背景裝飾 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-30">
          <div className="flex gap-8 text-8xl">
            <span>🌲</span><span>🌲</span><span>🌲</span><span>🌲</span>
          </div>
        </div>

        {/* 遠處的糖果屋（小） */}
        <div className="absolute top-8 right-1/4 flex flex-col items-center opacity-80">
          <div className="w-20 h-16 bg-pink-300 border-2 border-pink-400 rounded-t-2xl flex items-center justify-center">
            <span className="text-3xl">🏠</span>
          </div>
          <p className="text-pink-200 text-xs mt-1">那裡有一棟房子！</p>
        </div>

        {/* 兩兄妹 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-16">
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-24 bg-blue-200 border-2 border-blue-400 rounded-t-full flex items-center justify-center">
              <span className="text-3xl">👦</span>
            </div>
            <span className="text-xs text-green-200">漢賽爾</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-24 bg-pink-200 border-2 border-pink-400 rounded-t-full flex items-center justify-center">
              <span className="text-3xl">👧</span>
            </div>
            <span className="text-xs text-green-200">葛麗特</span>
          </div>
        </div>
      </div>

      {/* 對話框 */}
      <DialogueBox
        character={current.character}
        text={current.text}
        onNext={handleNext}
        isLast={isLast}
        lastLabel="走過去看看！"
      />
    </div>
  );
}
