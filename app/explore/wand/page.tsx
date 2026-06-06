"use client";

import { useState } from "react";
import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";

type WandStep = "locked" | "choose" | "collected";

const RUNES = [
  { id: "moon",  symbol: "☽", name: "月符", color: "#94a3b8" },
  { id: "star",  symbol: "✦", name: "星符", color: "#fbbf24" },
  { id: "water", symbol: "☿", name: "水符", color: "#38bdf8" },
  { id: "storm", symbol: "↯", name: "雷符", color: "#a78bfa" },
];
const CORRECT_RUNE = "star";

export default function ExploreWand() {
  const { addItem, collectedItems } = useGameStore();
  const alreadyCollected = collectedItems.includes("wand");

  const [step,      setStep]      = useState<WandStep>(alreadyCollected ? "collected" : "locked");
  const [runeMsg,   setRuneMsg]   = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  function handleRuneClick(id: string) {
    if (id === CORRECT_RUNE) {
      setRuneMsg("符文共鳴了，封印正在解除……");
      setUnlocking(true);
      setTimeout(() => { addItem("wand"); setStep("collected"); }, 1200);
    } else {
      setRuneMsg("符文排斥了，產生一陣刺痛感，再試一次吧");
    }
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-purple-950 px-6 gap-6 relative">
      <ActionButton
        href="/explore"
        variant="ghost"
        className="absolute top-4 left-4 text-purple-300 text-sm border border-purple-800 px-3 py-1 hover:bg-purple-900 transition-colors font-ui"
      >
        ← 返回
      </ActionButton>

      {/* 目標說明 */}
      <p className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-stone-400 text-xs font-ui">
        解開封印，取得這根散發著魔力的木棍
      </p>

      {/* Step 1：被封印的魔杖 */}
      {step === "locked" && (
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <div
            className="w-24 h-36 bg-purple-900 border-2 border-purple-500 flex items-center justify-center text-xs text-purple-400 font-ui"
            style={{ boxShadow: "0 0 18px #7c3aed88" }}
          >
            [魔杖 圖]
          </div>
          <p className="text-purple-100 text-base leading-relaxed font-body">
            廚房角落有一根散發幽暗光芒的木棍，被封印在一個透明容器裡。
          </p>
          <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-3 text-sm text-purple-200 leading-relaxed text-left font-body">
            <p>容器上刻著一道符文鎖。</p>
            <p className="mt-2">
              魔杖頂端隱約刻著一個<span className="text-yellow-300 font-bold">六芒星</span>狀的圖案……也許這就是解鎖的線索。
            </p>
          </div>
          <ActionButton
            onClick={() => setStep("choose")}
            variant="purple"
            className="border-2 border-purple-500 px-8 py-2 text-purple-300 font-bold font-ui hover:bg-purple-700 hover:text-white transition-colors"
          >
            試著解開封印
          </ActionButton>
        </div>
      )}

      {/* Step 2：選擇符文 */}
      {step === "choose" && (
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <div
            className={`w-24 h-36 border-2 rounded-lg flex items-center justify-center transition-all duration-700 ${
              unlocking ? "border-yellow-400 bg-yellow-950/40" : "border-purple-500 bg-purple-900"
            }`}
            style={{ boxShadow: unlocking ? "0 0 24px #fbbf2488" : "0 0 18px #7c3aed88" }}
          >
            <span className="text-yellow-300 text-4xl select-none">✡</span>
          </div>
          <p className="text-stone-400 text-xs font-ui">容器正面發光的封印符號</p>
          <p className="text-purple-200 text-sm font-body">
            選出與封印符號相符的符文，解開封印：
          </p>
          <div className="grid grid-cols-4 gap-3 w-full">
            {RUNES.map((rune) => (
              <ActionButton
                key={rune.id}
                onClick={() => !unlocking && handleRuneClick(rune.id)}
                disabled={unlocking}
                variant="ghost"
                className="flex flex-col items-center gap-2  border-white/90! rounded-lg p-3 transition-all hover:scale-105 hover:bg-white/20! hover:shadow-[0_0_14px_rgba(255,255,255,0.35)] active:scale-95 disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <span className="text-3xl font-bold select-none" style={{ color: rune.color }}>{rune.symbol}</span>
                <span className="text-xs font-ui font-bold" style={{ color: rune.color }}>{rune.name}</span>
              </ActionButton>
            ))}
          </div>
          {runeMsg && (
            <p className={`text-sm text-center font-body px-3 py-2 border rounded-lg transition-all ${
              unlocking
                ? "text-yellow-300 border-yellow-600 bg-yellow-950/40"
                : "text-red-400 border-red-800 bg-red-950/40"
            }`}>
              {runeMsg}
            </p>
          )}
        </div>
      )}

      {/* Step 3：已收集 */}
      {step === "collected" && (
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div
            className="w-24 h-36 bg-purple-800 border-2 border-purple-300 flex items-center justify-center text-xs text-purple-300 font-ui"
            style={{ boxShadow: "0 0 24px #a855f788" }}
          >
            [魔杖 圖]
          </div>
          <p className="text-green-400 font-bold text-base font-ui">巫婆魔杖已收集</p>
          <p className="text-purple-300 text-sm font-body">魔杖在手中微微顫動，彷彿在等待釋放……</p>
          <ActionButton
            href="/explore"
            variant="ghost"
            className="border-2 border-green-700 px-8 py-2 text-green-400 font-bold font-ui hover:bg-green-900 transition-colors"
          >
            返回場景
          </ActionButton>
        </div>
      )}
    </div>
  );
}
