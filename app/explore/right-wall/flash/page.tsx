"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Img from "next/image";
import { useGameStore } from "../../../../store/store";
import ActionButton from "../../../../component/ActionButton";

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
      <div className="w-full h-screen relative overflow-hidden flex flex-col gap-5 items-center justify-center bg-black">
        <Img
          src="/images/explore_right1.png"
          alt="right_wall"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none opacity-35 blur-xs"
        />

        <div className="relative z-10 w-full mx-8 max-w-2xl rounded-xl p-10 bg-stone-950/92 border border-amber-900/50 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col gap-6">
          <p className="text-stone-300 text-base font-body leading-relaxed">
            地板上有一張折疊的紙片，上面印著一些奇怪的符號……看起來像某種對照密碼表。
          </p>
          <div className="bg-stone-900/80 border border-amber-800/40 rounded-lg p-5">
            <p className="text-amber-400 text-sm font-bold mb-3 text-center font-ui tracking-widest">密碼對照表</p>
            <div className="grid grid-cols-13 gap-x-3 gap-y-2 font-mono text-xs text-center">
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch, i) => (
                <span key={ch} className="flex flex-col items-center gap-0.5">
                  <span className="text-stone-300">{ch}</span>
                  <span className="text-amber-400">{i + 1}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-6">
            <ActionButton onClick={handleCollect} href="/explore/right-wall" variant="gold">
              收集紙片
            </ActionButton>
            <ActionButton onClick={() => router.push("/explore/right-wall")} variant="ghost">
              離開
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }
}
