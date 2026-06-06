"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";

export default function ExploreLeftWall() {
  const router = useRouter();
  const { collectedItems } = useGameStore();
  const boxCollected = collectedItems.includes("box");

  return (
    <div className="w-full h-screen relative overflow-hidden bg-stone-900">
      {/* Background */}
      <img
        src="/images/explore_left.png"
        alt="left_wall"
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

      {/* Room scene — clickable items */}
      <div className="relative z-10 w-full h-full flex items-end justify-center pb-16">
        <button
          onClick={() => router.push("/explore/left-wall/box")}
          className="flex flex-col items-center gap-2 group mb-4"
        >
          <div
            className={`w-28 h-20 border-2 flex items-center justify-center text-xs font-ui rounded transition-colors
              ${boxCollected
                ? "bg-stone-800/60 border-dashed border-stone-700 text-stone-600 cursor-default"
                : "bg-stone-700 border-stone-500 text-stone-400 group-hover:border-amber-400"}`}
          >
            {boxCollected ? "[空了]" : "[箱子]"}
          </div>
          <span className={`text-xs font-ui transition-colors
            ${boxCollected ? "text-stone-600" : "text-stone-500 group-hover:text-amber-300"}`}>
            {boxCollected ? "箱子已清空" : "舊箱子"}
          </span>
        </button>
      </div>
    </div>
  );
}
