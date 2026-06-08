"use client";

import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";
import Img from "next/image";

export default function ExploreRightWall() {
  const { collectedItems } = useGameStore();
  const cipherCollected = collectedItems.includes("wand");
  const wandCollected   = collectedItems.includes("magicwand");

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      {/* Background */}
      <Img
        src="/images/explore_right.png"
        alt="right_wall"
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

      {/* Room scene */}
      <div className="relative z-10 w-full h-full flex items-end justify-center gap-20 pb-16">

        {/* 魔仗 */}
        <ActionButton
          href={wandCollected ? undefined : "/explore/right-wall/wand"}
          variant="ghost"
          className="absolute bottom-1/3 right-1/5 flex-col gap-2 mb-4 border-none! p-0! bg-transparent! hover:bg-transparent! group"
        >
          <Img
            src="/item_images/wand.png"
            alt="魔杖"
            width={75}
            height={180}
            className={`
              object-contain
              transition-all duration-200
              -rotate-40
              ${
                wandCollected
                  ? "opacity-50 grayscale"
                  : "group-hover:scale-110 drop-shadow-[0_0_18px_rgba(251,191,36,0.95)]"
              }
            `}
          />
          <span className={`text-xs font-ui transition-colors
            ${wandCollected ? "text-stone-600" : "text-stone-500 group-hover:text-amber-300"}`}>
            {wandCollected ? "✓ 已蒐集" : "魔仗"}
          </span>
        </ActionButton>

        {/* 地板發光點（密碼表） */}
        <div className="relative top-1/12 right-1/3 flex flex-col items-center mb-4">
          {cipherCollected ? (
            <p className="text-stone-500 text-xs font-ui">地板上的發光點消失了</p>
          ) : (
            <ActionButton
              href="/explore/right-wall/flash"
              variant="ghost"
              className="flex-col gap-3 border-none! p-0! bg-transparent! hover:bg-transparent! group"
            >
              <div className="relative w-8 h-8 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-yellow-400/60 animate-ping" />
                <div className="relative w-8 h-8 rounded-full bg-yellow-300 border-2 border-yellow-100 flex items-center justify-center z-10">
                  <span className="text-yellow-800 text-sm">✦</span>
                </div>
              </div>
              <span className="text-xs text-stone-500 group-hover:text-yellow-300 font-ui transition-colors">
                地板上有什麼在發光……
              </span>
            </ActionButton>
          )}
        </div>
      </div>

    </div>
  );
}
