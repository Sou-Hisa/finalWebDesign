"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-gray-600 text-gray-100 border border-gray-500 text-xs font-ui ${className}`}>
      {label}
    </div>
  );
}

export default function Chapter00() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const dialogues = useGameStore((s) => s.chapter00Dialogues);

  const current = dialogues[index];
  const isLast = index === dialogues.length - 1;

  function handleNext() {
    if (isLast) router.push("/chapter01");
    else setIndex((i) => i + 1);
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-400">
      {/* 主場景 */}
      <div className="flex-1 relative">
        {/*<Placeholder label="[森林場景 背景圖]" className="absolute inset-0" />*/}
        <div
          className="
            absolute inset-0
            bg-[url('/images/bg_ch00.png')]
            bg-auto
            bg-center
            bg-no-repeat
            opacity-40
          "
          style={{
            backgroundSize: "auto 100%",
          }}
        />
        
        {/* 角色立繪 */}
        <Placeholder label="[漢賽爾 立繪]" className="absolute bottom-20 left-30 w-28 h-40" />
        <Placeholder label="[葛麗特 立繪]" className="absolute bottom-20 right-30 w-28 h-40" />
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
