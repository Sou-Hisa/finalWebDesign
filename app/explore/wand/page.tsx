"use client";

import { useState } from "react";
import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";

type Step = "scene" | "inspect" | "collect" | "done";

export default function ExploreRightWall() {
  const { addItem, collectedItems } = useGameStore();
  const alreadyCollected = collectedItems.includes("wand");
  const [step,           setStep]           = useState<Step>(alreadyCollected ? "done" : "scene");
  const [showCipherImg,  setShowCipherImg]  = useState(false);

  function handleCollect() {
    addItem("wand");
    setStep("collect");
  }

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
        className="absolute top-4 right-4 z-20 text-stone-400 text-sm border border-stone-700 px-3 py-1 font-ui"
      >
        返回
      </ActionButton>

      {/* ── Scene / Done ── */}
      {(step === "scene" || step === "done") && (
        <div className="relative z-10 w-full h-full flex items-end justify-center pb-16">
          {step === "scene" ? (
            <button
              onClick={() => setStep("inspect")}
              className="mb-8 flex flex-col items-center gap-3 group"
            >
              {/* Blinking flash point */}
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
          ) : (
            <p className="text-stone-500 text-xs font-ui mb-8">地板上的發光點消失了</p>
          )}
        </div>
      )}

      {/* ── Inspect modal (image 2 style) ── */}
      {step === "inspect" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm mx-4 bg-white rounded-lg overflow-hidden shadow-2xl">
            <div className="p-5">
              <p className="text-gray-700 text-sm font-body leading-relaxed">
                地板上有一張折疊的紙片，上面印著一些奇怪的符號……看起來像某種對照密碼表。
              </p>
            </div>
            <div className="mx-4 mb-4 px-3 py-2 bg-gray-100 border border-gray-300 rounded text-center">
              <span className="text-gray-600 text-xs font-ui">密碼對照表</span>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={handleCollect}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-ui font-bold transition-colors"
              >
                蒐集
              </button>
              <button
                onClick={() => setStep("scene")}
                className="flex-1 py-3 text-gray-500 text-sm font-ui border-l border-gray-200 hover:bg-gray-50 transition-colors"
              >
                離開
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Collect view (image 3 style, full-screen) ── */}
      {step === "collect" && (
        <div className="fixed inset-0 z-50 flex flex-col bg-stone-800">
          <ActionButton
            href="/explore"
            variant="ghost"
            className="absolute top-4 right-4 z-20 text-stone-400 text-sm border border-stone-700 px-3 py-1 font-ui"
          >
            返回
          </ActionButton>

          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-md h-52 bg-stone-600 border border-stone-500 flex items-center justify-center text-stone-400 text-xs font-ui rounded">
              [密碼對照表圖片]
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 mb-4">
            <p className="text-stone-200 text-sm font-ui">密碼對照表</p>
            <ActionButton
              onClick={() => setStep("done")}
              variant="ghost"
              className="px-8 py-2 border border-stone-400 text-stone-200 font-ui"
            >
              確認
            </ActionButton>
          </div>

          {/* Backpack bar inside collect view */}
          <div className="px-4 py-2 bg-stone-900/95 border-t border-stone-700 flex items-center gap-3 h-12">
            <span className="text-xs font-ui text-stone-500">背包</span>
            {collectedItems.includes("box")   && <span className="text-xl" title="舊箱子">📦</span>}
            {collectedItems.includes("bones") && <span className="text-xl" title="白色骨頭">🦴</span>}
            <button onClick={() => setShowCipherImg(true)} title="密碼表（點擊查看）" className="text-xl leading-none">📜</button>
          </div>
        </div>
      )}

      {/* Cipher image modal (from backpack) */}
      {showCipherImg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70">
          <div className="w-full max-w-sm mx-4 bg-stone-800 border border-stone-600 rounded-lg overflow-hidden shadow-2xl">
            <div className="w-full h-52 bg-stone-600 flex items-center justify-center text-stone-400 text-xs font-ui">
              [密碼對照表圖片]
            </div>
            <div className="p-4 flex justify-center">
              <ActionButton
                onClick={() => setShowCipherImg(false)}
                variant="ghost"
                className="px-6 py-2 text-stone-300 font-ui"
              >
                關閉
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Persistent backpack bar (scene / done steps) */}
      {step !== "collect" && (
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-2 bg-stone-900/95 border-t border-stone-700 flex items-center gap-3 h-12">
          <span className="text-xs font-ui text-stone-500">背包</span>
          {collectedItems.includes("box")   && <span className="text-xl" title="舊箱子">📦</span>}
          {collectedItems.includes("bones") && <span className="text-xl" title="白色骨頭">🦴</span>}
          {collectedItems.includes("wand") && (
            <button onClick={() => setShowCipherImg(true)} title="密碼表（點擊查看）" className="text-xl leading-none">📜</button>
          )}
        </div>
      )}
    </div>
  );
}
