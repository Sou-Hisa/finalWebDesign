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
        src="/images/explore_left.png"
        alt="left_wall"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none opacity-80"
      />

      {/* Return */}
      <ActionButton
        href="/explore"
        variant="white"
        className="absolute top-4 left-4 z-20 text-sm font-ui"
      >
        返回
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
              width={160}
              height={100}
              className={`
                object-contain
                transition-transform
                ${
                  boxCollected
                    ? "opacity-50 grayscale"
                    : "group-hover:scale-105"
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
