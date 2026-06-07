"use client";

import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";
import Img from "next/image";

export default function ExploreCenterWall() {
  const { collectedItems } = useGameStore();
  const bonesCollected  = collectedItems.includes("bones");
  const noteCollected   = collectedItems.includes("note");
  const puzzleSolved    = collectedItems.includes("puzzle");
  const showPuzzleBox   = ["box", "bones", "wand", "magicwand"].every(k => collectedItems.includes(k));

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      <Img
        src="/images/explore_middle.png"
        alt="background"
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

      {/* Room scene — bookshelf with items */}
      <div className="relative z-10 w-full h-full flex items-center justify-center gap-20 pb-12">

        {/* Encyclopedia */}
        <ActionButton
          href={bonesCollected ? undefined : "/explore/center-wall/encyclopedia"}
          className="flex-col gap-3 border-0! p-0! bg-transparent! hover:bg-transparent! group"
        >
          <img
            src="/images/explore_item_encyclopedia.png"
            alt="百科全書"
            className={`
              w-36
              h-auto
              object-contain
              transition-all
              ${
                bonesCollected
                  ? "opacity-50 grayscale"
                  : `
                    group-hover:scale-105
                    drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]
                  `
              }
            `}
          />
          <span className={`text-xs font-ui transition-colors
            ${bonesCollected ? "text-stone-600" : "text-stone-500 group-hover:text-amber-300"}`}>
            {bonesCollected ? "✓ 已對照" : "百科全書"}
          </span>
        </ActionButton>

        {/* Cipher recipe */}
        <ActionButton
          href={noteCollected ? undefined : "/explore/center-wall/cipher-recipe"}
          className="flex-col gap-2 border-0! p-0! bg-transparent! hover:bg-transparent! group"
        >
          <img
            src="/images/explore_item_sheet.png"
            alt="密碼食譜"
            className={`
              w-20
              h-auto
              object-contain
              transition-transform
              ${
                noteCollected
                  ? "opacity-50 grayscale"
                  : "group-hover:scale-105"
              }
            `}
          />
          <span className={`text-xs font-ui transition-colors
            ${noteCollected ? "text-stone-600" : "text-stone-500 group-hover:text-amber-300"}`}>
            {noteCollected ? "✓ 已解碼" : "密碼食譜"}
          </span>
        </ActionButton>

        {/* 木盒（4件物品全收後出現） */}
        {showPuzzleBox && (
          <ActionButton
            href={puzzleSolved ? undefined : "/explore/center-wall/puzzle-box"}
            className="flex-col gap-2 border-0! p-0! bg-transparent! hover:bg-transparent! group"
          >
            <div
              className={`w-20 h-16 border-2 flex items-center justify-center text-xs font-ui rounded transition-colors
                ${puzzleSolved
                  ? "bg-stone-800/60 border-dashed border-stone-700 text-stone-600"
                  : "bg-amber-900 border-amber-700 text-amber-400 group-hover:border-amber-400 animate-pulse"}`}
            >
              {puzzleSolved ? "✓" : "[木盒]"}
            </div>
            <span className={`text-xs font-ui transition-colors
              ${puzzleSolved ? "text-stone-600" : "text-amber-500 group-hover:text-amber-300"}`}>
              {puzzleSolved ? "✓ 已開啟" : "神秘木盒"}
            </span>
          </ActionButton>
        )}
      </div>

    </div>
  );
}
