"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
        <div
          className="
            absolute inset-0
            bg-[url('/images/ch02_bg.png')]
            bg-center
            bg-no-repeat
          "
          style={{
            backgroundSize: "auto 100%",
          }}
        />

        {/* 角色立繪 */}
        {/* 漢賽爾 */}
        <div className="absolute bottom-25 left-10 w-45 h-60">
          <Image
            src="/item_images/hansel_scared.png"
            alt="漢賽爾 立繪"
            fill
            priority
            sizes="120px"
            className="object-contain object-bottom"
          />
        </div>

        {/* 葛麗特 */}
        <div className="absolute bottom-25 left-45 w-45 h-60">
          <Image
            src="/item_images/gretel_scared.png"
            alt="葛麗特 立繪"
            fill
            priority
            sizes="120px"
            className="object-contain object-bottom"
          />
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
