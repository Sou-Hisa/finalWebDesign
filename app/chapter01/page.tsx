"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";


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
        {/* 老婆婆 */}
        <div className="absolute bottom-15 right-20 w-45 h-60">
          <Image
            src="/item_images/granny.png"
            alt="老婆婆 立繪"
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
          lastLabel="進入屋內"
        />
    </div>
  );
}
