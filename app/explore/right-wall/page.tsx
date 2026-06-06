"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";

export default function ExploreRightWall() {
  const router = useRouter();
  const { collectedItems } = useGameStore();
  const cipherCollected = collectedItems.includes("wand");
  const wandCollected   = collectedItems.includes("magicwand");

  return (
    <div className="w-full h-screen relative overflow-hidden bg-stone-900">
      {/* Background */}
    <img
      src="/images/explore_right.png"
      alt="right_wall"
      className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none"
    />

      {/* Return */}
      <ActionButton
        href="/explore"
        variant="ghost"
        className="absolute top-4 left-4 z-20 text-stone-400 text-sm border border-stone-700 px-3 py-1 font-ui"
      >
        返回
      </ActionButton>

      {/* Room scene */}
      <div className="relative z-10 w-full h-full flex items-end justify-center gap-20 pb-16">

        {/* 魔仗 */}
        <button
          onClick={() => !wandCollected && router.push("/explore/right-wall/wand")}
          className="flex flex-col items-center gap-2 group mb-4"
        >
          <div className={`w-12 h-28 border-2 flex items-center justify-center text-lg rounded transition-colors
            ${wandCollected
              ? "bg-stone-800/60 border-dashed border-stone-700 text-stone-600 cursor-default"
              : "bg-stone-700 border-stone-500 group-hover:border-purple-400 cursor-pointer"}`}
          >
            🪄
          </div>
          <span className={`text-xs font-ui transition-colors
            ${wandCollected ? "text-stone-600" : "text-stone-500 group-hover:text-purple-300"}`}>
            {wandCollected ? "✓ 已蒐集" : "魔仗"}
          </span>
        </button>

        {/* 地板發光點（密碼表） */}
        <div className="flex flex-col items-center mb-4">
          {cipherCollected ? (
            <p className="text-stone-500 text-xs font-ui">地板上的發光點消失了</p>
          ) : (
            <button
              onClick={() => router.push("/explore/right-wall/flash")}
              className="flex flex-col items-center gap-3 group"
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-yellow-400/60 animate-ping" />
                <div className="relative w-10 h-10 rounded-full bg-yellow-300 border-2 border-yellow-100 flex items-center justify-center z-10">
                  <span className="text-yellow-800 text-sm">✦</span>
                </div>
              </div>
              <span className="text-xs text-stone-500 group-hover:text-yellow-300 font-ui transition-colors">
                地板上有什麼在發光……
              </span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
