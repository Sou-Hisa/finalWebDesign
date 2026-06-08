"use client";

import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";
import Img from "next/image";

export default function ExploreLeftWall() {
  const { collectedItems } = useGameStore();
  const boxCollected = collectedItems.includes("box");

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Background */}
      <Img
        src="/images/explore_left0.png"
        alt="left_wall"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none opacity-65"
      />

      {/* Return */}
      <ActionButton
        href="/explore"
        variant="back"
        className="absolute top-4 left-4 z-20"
      >
        ← 返回
      </ActionButton>

      {/* Room scene — clickable items */}
      <div className="relative z-10 w-full h-full flex items-end justify-center pb-16">
        <ActionButton
          href={boxCollected ? undefined : "/explore/left-wall/box"}
          variant="ghost"
          className="absolute top-3/5 left-2/3 flex-col gap-2 border-none! p-0! bg-transparent! hover:bg-transparent! group"
        >
          <div>
            <Img
              src="/item_images/box_close.png"
              alt="箱子關"
              width={220}
              height={140}
              className={`
                object-contain
                h-auto
                transition-all duration-200
                ${
                  boxCollected
                    ? "opacity-50 grayscale"
                    : "group-hover:scale-110 drop-shadow-[0_0_16px_rgba(251,191,36,0.85)]"
                }
            `}
            />
          </div>
          <span className={`text-xs font-ui transition-colors
            ${boxCollected ? "text-stone-600" : "text-stone-500 group-hover:text-amber-300"}`}>
            {boxCollected ? "箱子已清空" : "舊箱子"}
          </span>
        </ActionButton>
      </div>
    </div>
  );
}
