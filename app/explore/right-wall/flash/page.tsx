"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../../../store/store";
import ActionButton from "../../../../component/ActionButton";
import ItemBar from "../../../../component/ItemBar";

type Step = "inspect" | "collect";

export default function RightWallFlash() {
  const router = useRouter();
  const { addItem, collectedItems } = useGameStore();
  const alreadyCollected = collectedItems.includes("wand");
  const [step, setStep] = useState<Step>("inspect");

  function handleCollect() {
    addItem("wand");
    setStep("collect");
    router.push("/explore/right-wall")
  }

  /* ── Already collected ── */
  if (alreadyCollected && step === "inspect") {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-900 gap-4">
        <p className="text-stone-500 text-sm font-ui">地板上的發光點消失了</p>
        <ActionButton href="/explore/right-wall" variant="ghost" className="px-6 py-2 font-ui text-stone-400 border border-stone-700">
          返回
        </ActionButton>
      </div>
    );
  }

  /* ── Inspect: image 2 style ── */
  if (step === "inspect") {
    return (
      <div className="w-full h-screen relative overflow-hidden flex flex-col gap-5 items-center justify-center">
        <div className="absolute pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-lg">
          <div className="p-5 flex flex-col gap-3">
            <p className="text-gray-700 text-sm font-body leading-relaxed">
              地板上有一張折疊的紙片，上面印著一些奇怪的符號……看起來像某種對照密碼表。
            </p>
            {/* 密碼對照表 */}
            <div className=" bg-stone-800 border border-amber-700 rounded-lg p-3">
              <p className="text-amber-400 text-xs font-bold mb-2 text-center font-ui">密碼對照表</p>
              <div className="grid grid-cols-13 gap-x-2 gap-y-1 font-mono text-[10px] text-center">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch, i) => (
                  <span key={ch} className="flex flex-col items-center">
                    <span className="text-stone-300">{ch}</span>
                    <span className="text-amber-400">{i + 1}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-around gap-5 items-center">
          <ActionButton
            onClick={handleCollect}
            href="/explore/right-wall"
            variant="red"
          >
            收集紙片
          </ActionButton>

          <ActionButton
            onClick={() => router.push("/explore/right-wall")}
            variant="ghost"
          >
            離開
          </ActionButton>
        </div>
      </div>
    );
  }
}
