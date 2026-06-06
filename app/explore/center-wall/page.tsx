"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";

export default function ExploreCenterWall() {
  const router = useRouter();
  const { collectedItems } = useGameStore();
  const bonesCollected = collectedItems.includes("bones");
  const noteCollected  = collectedItems.includes("note");

  return (
    <div className="w-full h-screen relative overflow-hidden bg-stone-900">
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-600/30 to-stone-900 pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-stone-600/30 text-xs font-ui select-none">[中間牆壁 背景佔位]</span>
      </div>

      {/* Return */}
      <ActionButton
        href="/explore"
        variant="ghost"
        className="absolute top-4 left-4 z-20 text-stone-400 text-sm border border-stone-700 px-3 py-1 font-ui"
      >
        返回
      </ActionButton>

      {/* Room scene — bookshelf with items */}
      <div className="relative z-10 w-full h-full flex items-center justify-center gap-20 pb-12">

        {/* Encyclopedia */}
        <button
          onClick={() => router.push("/explore/center-wall/encyclopedia")}
          className="flex flex-col items-center gap-2 group"
        >
          <div
            className={`w-20 h-28 border-2 flex items-center justify-center text-xs font-ui rounded transition-colors
              ${bonesCollected
                ? "bg-stone-800/60 border-dashed border-stone-700 text-stone-600"
                : "bg-stone-700 border-stone-500 text-stone-400 group-hover:border-amber-400"}`}
          >
            [百科全書]
          </div>
          <span className={`text-xs font-ui transition-colors
            ${bonesCollected ? "text-stone-600" : "text-stone-500 group-hover:text-amber-300"}`}>
            {bonesCollected ? "✓ 已對照" : "百科全書"}
          </span>
        </button>

        {/* Cipher recipe */}
        <button
          onClick={() => router.push("/explore/center-wall/cipher-recipe")}
          className="flex flex-col items-center gap-2 group"
        >
          <div
            className={`w-16 h-24 border-2 flex items-center justify-center text-xs font-ui rounded transition-colors
              ${noteCollected
                ? "bg-stone-800/60 border-dashed border-stone-700 text-stone-600"
                : "bg-stone-700 border-stone-500 text-stone-400 group-hover:border-red-400"}`}
          >
            [密碼食譜]
          </div>
          <span className={`text-xs font-ui transition-colors
            ${noteCollected ? "text-stone-600" : "text-stone-500 group-hover:text-red-300"}`}>
            {noteCollected ? "✓ 已解碼" : "密碼食譜"}
          </span>
        </button>
      </div>

    </div>
  );
}
