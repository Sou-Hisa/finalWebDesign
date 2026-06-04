"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";

export default function Chapter02() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const dialogues = useGameStore((s) => s.chapter02Dialogues);

  const current = dialogues[index];
  const isLast = index === dialogues.length - 1;

  function handleNext() {
    if (isLast) {
      router.push("/battle");
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-red-950 relative overflow-hidden">
      {/* 背景：昏暗的糖果屋，發現真相 */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* 食譜特寫 */}
        <div className="w-56 bg-amber-50 border-4 border-amber-800 rounded p-4 shadow-2xl rotate-3 flex flex-col gap-2">
          <p className="text-center font-bold text-red-800 text-base">📕 小孩食譜</p>
          <p className="text-xs text-red-700 italic text-center leading-relaxed">
            「如何烤出鮮嫩多汁的<br />小女孩與小男孩……」
          </p>
          <div className="border-t border-amber-300 pt-2 flex justify-center gap-2">
            <span className="text-lg">🍳</span>
            <span className="text-lg">👧</span>
            <span className="text-lg">👦</span>
          </div>
        </div>

        {/* 兩兄妹 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-12">
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-24 bg-blue-200 border-2 border-blue-400 rounded-t-full flex items-center justify-center">
              <span className="text-3xl">👦</span>
            </div>
            <span className="text-xs text-amber-200">漢賽爾</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-24 bg-pink-200 border-2 border-pink-400 rounded-t-full flex items-center justify-center">
              <span className="text-3xl">👧</span>
            </div>
            <span className="text-xs text-amber-200">葛麗特</span>
          </div>
        </div>
      </div>

      {/* 對話框 */}
      <DialogueBox
        character={current.character}
        text={current.text}
        onNext={handleNext}
        isLast={isLast}
        lastLabel="對付巫婆！"
      />
    </div>
  );
}
