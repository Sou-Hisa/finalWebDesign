"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../../store/store";

type Step = "box" | "inspect" | "book" | "done";

export default function ExploreBones() {
  const router = useRouter();
  const { addItem, collectedItems } = useGameStore();
  const alreadyCollected = collectedItems.includes("bones");

  const [step, setStep] = useState<Step>(alreadyCollected ? "done" : "box");

  function collect() {
    addItem("bones");
    setStep("done");
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-950 px-6 gap-6 relative">
      {/* 返回 */}
      <button
        onClick={() => router.push("/explore")}
        className="absolute top-4 left-4 text-stone-400 text-sm border border-stone-700 px-3 py-1 hover:bg-stone-800 transition-colors"
      >
        ← 返回
      </button>

      {/* Step 1：看到箱子 */}
      {step === "box" && (
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <span className="text-7xl">📦</span>
          <p className="text-stone-200 text-base leading-relaxed">
            角落裡有一個滿是灰塵的舊箱子。<br />蓋子半開著，從縫隙裡透出一股詭異的氣息……
          </p>
          <button
            onClick={() => setStep("inspect")}
            className="border-2 border-stone-400 px-8 py-2 text-stone-200 font-bold hover:bg-stone-700 transition-colors"
          >
            打開箱子
          </button>
        </div>
      )}

      {/* Step 2：發現骨頭 */}
      {step === "inspect" && (
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <span className="text-7xl animate-bounce">🦴</span>
          <p className="text-stone-200 text-base leading-relaxed">
            箱子裡裝著一些奇怪的白色長條物……
            <br /><br />
            <span className="text-red-400 font-bold">等等，這好像是骨頭！？</span>
            <br /><br />
            快把它們帶到書架上的百科全書比對看看。
          </p>
          <button
            onClick={() => setStep("book")}
            className="border-2 border-red-600 px-8 py-2 text-red-400 font-bold hover:bg-red-900 transition-colors"
          >
            拿去比對百科全書
          </button>
        </div>
      )}

      {/* Step 3：對照百科 */}
      {step === "book" && (
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <div className="flex gap-3 text-5xl">
            <span>📖</span><span>🦴</span>
          </div>
          <div className="bg-stone-800 border border-stone-600 rounded p-4 text-left text-sm text-stone-300 leading-relaxed">
            <p className="font-bold text-amber-300 mb-2">骨骼百科全書 ── 第 47 頁</p>
            <p>書頁上畫滿了各種動物的骨架。</p>
            <p className="mt-2">把剛才收集到的骨頭拿來比對看看吧……</p>
            <p className="mt-3 text-red-400 font-bold">
              天啊！這尺寸和形狀，根本不是動物，<br />
              這是人類小孩的骨頭！
            </p>
          </div>
          <button
            onClick={collect}
            className="border-2 border-red-600 px-8 py-2 text-red-400 font-bold hover:bg-red-900 transition-colors"
          >
            收進背包
          </button>
        </div>
      )}

      {/* Step done */}
      {step === "done" && (
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <span className="text-6xl">🦴</span>
          <p className="text-green-400 font-bold text-base">✅ 骨頭證據已收集</p>
          <p className="text-stone-400 text-sm">已確認是人類小孩的骨頭……</p>
          <button
            onClick={() => router.push("/explore")}
            className="border-2 border-green-700 px-8 py-2 text-green-400 font-bold hover:bg-green-900 transition-colors"
          >
            返回場景
          </button>
        </div>
      )}
    </div>
  );
}
