"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";


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
    <div className="w-full h-screen flex flex-col bg-black">
      {/* 主場景 */}
      <div className="flex-1 relative">
        <div
          className="
            absolute inset-0
            bg-[url('/images/ch00_bg.png')]
            bg-auto
            bg-center
            bg-no-repeat
          "
          style={{
            backgroundSize: "auto 100%",
          }}
        />
        {/* 深色遮罩 */}
        <div className="absolute inset-0 bg-black/55" />

        {/* 角色立繪 */}
        {/* 漢賽爾 */}
        <div className="absolute bottom-25 left-15 w-45 h-60">
          <Image
            src="/item_images/H_ha.PNG"
            alt="漢賽爾 立繪"
            fill
            priority
            sizes="120px"
            className="object-contain object-bottom"
          />
        </div>

        {/* 葛麗特 */}
        <div className="absolute bottom-25 left-50 w-45 h-60">
          <Image
            src="/item_images/G_ha.PNG"
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
        lastLabel="走過去看看！"
      />
    </div>
  );
}