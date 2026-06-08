"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Img from "next/image";
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
      <div className="w-full h-screen relative flex flex-col items-center justify-center gap-5 bg-black overflow-hidden">
        <Img
          src="/images/explore_left.png"
          alt="left_wall"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none opacity-35 blur-xs"
        />

        <div className="relative z-10 w-full mx-8 max-w-2xl rounded-xl p-10 bg-stone-950/92 border border-amber-900/50 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col gap-6">
          <div className="relative w-full h-64 bg-black/50 rounded-lg border border-amber-900/30 flex items-center justify-center overflow-hidden">
            <Img
              src="/item_images/box_open.png"
              alt="箱子開"
              width={320}
              height={220}
              className="object-contain drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            />
          </div>

          <p className="text-stone-300 text-base font-body leading-relaxed">
            箱子裡裝著一些奇怪的白色長條物……等等，這好像是骨頭！？仔細把它們收集到背包裡，或許能在哪裡查出這是什麼生物的骨頭。
          </p>

          <div className="flex justify-center gap-6">
            <ActionButton onClick={handleCollect} href="/explore/left-wall" variant="gold">
              蒐集
            </ActionButton>
            <ActionButton href="/explore/left-wall" variant="ghost">
              離開
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  
}
