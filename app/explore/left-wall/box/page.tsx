"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../../../store/store";
import ActionButton from "../../../../component/ActionButton";
import ItemBar from "../../../../component/ItemBar";

type Step = "inspect" | "collect";

export default function LeftWallBox() {
  const router = useRouter();
  const { addItem, collectedItems } = useGameStore();
  const alreadyCollected = collectedItems.includes("box");
  const [step, setStep] = useState<Step>("inspect");

  function handleCollect() {
    addItem("box");
    setStep("collect");
    router.push("/explore/left-wall")
  }

  /* ── Already collected ── */
  if (alreadyCollected && step === "inspect") {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-900 gap-4">
        <div className="w-28 h-20 bg-stone-800/60 border-2 border-dashed border-stone-700 flex items-center justify-center text-stone-600 text-xs font-ui rounded">
          [空了]
        </div>
        <p className="text-stone-500 text-sm font-ui">箱子已被清空</p>
        <ActionButton href="/explore/left-wall" variant="ghost" className="mt-2 px-6 py-2 font-ui text-stone-400 border border-stone-700">
          返回
        </ActionButton>
      </div>
    );
  }

  /* ── Inspect: image 2 style ── */
  if (step === "inspect") {
    return (
      <div className="w-full h-screen relative flex flex-col items-center justify-center gap-5">
        <div className="absolute inset-0 pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-lg overflow-hidden shadow-2xl">
          {/* Description */}
          <div className="p-5">
            <p className="text-gray-700 text-sm font-body leading-relaxed">
              箱子裡裝著一些奇怪的白色長條物……等等，這好像是骨頭！？仔細把它們收集到背包裡，或許能在哪裡查出這是什麼生物的骨頭。
            </p>
          </div>
          {/* Item label */}
          <div className="mx-4 mb-4 px-3 py-2 bg-gray-100 border border-gray-300 rounded text-center">
            <span className="text-gray-600 text-xs font-ui">打開的舊箱子（裡面裝滿人骨頭）[圖片]</span>
          </div>
          {/* Buttons */}
        </div>
        <div className="flex justify-around gap-5 items-center border-gray-200">
          <ActionButton
            onClick={handleCollect}
            href="/explore/left-wall"
            variant="gold"
          >
            蒐集
          </ActionButton>
          <ActionButton
            href="/explore/left-wall"
            variant="ghost"
          >
            離開
          </ActionButton>
        </div>
      </div>
    );
  }

  
}
