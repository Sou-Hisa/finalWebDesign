"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-gray-700 text-gray-100 border border-gray-500 text-xs font-ui ${className}`}>
      {label}
    </div>
  );
}

export default function Chapter02() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const dialogues = useGameStore((s) => s.chapter02Dialogues);

  const current = dialogues[index];
  const isLast = index === dialogues.length - 1;

  function handleNext() {
    if (isLast) router.push("/battle");
    else setIndex((i) => i + 1);
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-400">
      {/* 主場景 */}
      <div className="flex-1 relative">
        <Placeholder label="[真相揭露 背景圖]" className="absolute inset-0" />

        {/* 食譜書特寫 */}
        <Placeholder label="[食譜書 特寫圖]" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-52" />

        {/* 角色立繪 */}
        <Placeholder label="[葛麗特 立繪]" className="absolute bottom-20 left-30 w-28 h-40" />
        <Placeholder label="[漢賽爾 立繪]" className="absolute bottom-20 left-60 w-28 h-40" />
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
