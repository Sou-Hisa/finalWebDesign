"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";

export default function ExploreRightWall() {
  const router = useRouter();
  const { collectedItems } = useGameStore();
  const cipherCollected = collectedItems.includes("wand");

  return (
    <div className="w-full h-screen relative overflow-hidden bg-stone-900">
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-700/40 to-stone-900 pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-stone-600/30 text-xs font-ui select-none">[右側牆壁 背景佔位]</span>
      </div>

      {/* Return */}
      <ActionButton
        href="/explore"
        variant="ghost"
        className="absolute top-4 left-4 z-20 text-stone-400 text-sm border border-stone-700 px-3 py-1 font-ui"
      >
        返回
      </ActionButton>

      {/* Room scene */}
      <div className="relative z-10 w-full h-full flex items-end justify-center pb-16">
        {cipherCollected ? (
          <p className="text-stone-500 text-xs font-ui mb-8">地板上的發光點消失了</p>
        ) : (
          <button
            onClick={() => router.push("/explore/right-wall/flash")}
            className="mb-8 flex flex-col items-center gap-3 group"
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
  );
}
