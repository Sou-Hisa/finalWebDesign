"use client";

import { useState } from "react";
import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";

const ANSWER = "HELP";
type CipherStep = "note" | "input" | "solved";

export default function ExploreCipher() {
  const { addItem, collectedItems } = useGameStore();
  const alreadyCollected = collectedItems.includes("note");

  const [step,  setStep]  = useState<CipherStep>(alreadyCollected ? "solved" : "note");
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit() {
    if (input.toUpperCase().trim() === ANSWER) {
      addItem("note");
      setStep("solved");
      setError(false);
    } else {
      setError(true);
    }
  }

  return (
    <div className="w-full h-screen flex flex-col items-center bg-black relative overflow-hidden">

      {/* 背景圖：/public/images/bg_cipher.png（右側牆－書桌密碼區） */}
      <div className="absolute inset-0 bg-[url('/images/bg_cipher.png')] bg-cover bg-center bg-no-repeat bg-amber-950" />
      <div className="absolute inset-0 bg-black/60" />

      {/* 返回按鈕 */}
      <ActionButton
        href="/explore"
        variant="ghost"
        className="absolute top-4 left-4 z-20 text-amber-300 text-sm border border-amber-700 px-3 py-1 font-ui"
      >
        ← 返回
      </ActionButton>

      {/* 目標提示 */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-stone-500 text-xs font-ui">
        解讀紙條上的數字訊息
      </p>

      {/* ── Step 1：開場 + 紙條 ── */}
      {step === "note" && (
        <div className="relative z-10 flex flex-col items-center w-full h-full">
          <div className="flex-25" />

          {/* 大字場景敘事 */}
          <div className="w-full max-w-2xl px-8 flex flex-col gap-2 mb-8">
            <p className="font-title font-bold text-4xl text-white/90 leading-snug">
              書桌上壓著一張皺皺的紙條，
            </p>
            <p className="font-title font-bold text-4xl text-white/70 leading-snug">
              字跡歪扭，佈滿奇怪的符號……
            </p>
          </div>

          {/* 功能卡片區 */}
          <div className="flex flex-col items-center gap-4 w-full max-w-sm px-4">

            <div className="w-full bg-amber-50 rounded-lg p-4 shadow-2xl rotate-1 flex flex-col gap-3">
              <p className="text-center font-bold text-amber-900 text-sm font-title">神秘紙條</p>
              <div className="border-t border-amber-300 pt-3 text-center">
                <p className="text-xs text-stone-500 mb-1 font-ui">紙條上寫著：</p>
                <p className="text-3xl font-black text-amber-900 tracking-[0.3em] font-ui">8 · 5 · 12 · 16</p>
              </div>
            </div>

            <div className="w-full bg-stone-800 border border-amber-700/50 rounded-lg p-3">
              <p className="text-amber-400 text-xs font-bold mb-2 text-center font-ui">書桌上夾著一張字母對照表</p>
              <div className="grid grid-cols-13 gap-x-2 gap-y-0.5 font-mono text-[10px] text-center">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch, i) => (
                  <span key={ch} className="text-stone-400">
                    {ch}<br />
                    <span className="text-amber-400">{i + 1}</span>
                  </span>
                ))}
              </div>
            </div>

            <p className="text-amber-300/80 text-sm text-center font-body">
              對照看看——8·5·12·16 各對應哪個字母？
            </p>

            <div className="w-full flex gap-3">
              <ActionButton href="/explore" variant="ghost" className="flex-1 text-sm font-ui text-stone-500">
                先去其他地方
              </ActionButton>
              <ActionButton onClick={() => setStep("input")} variant="gold" className="flex-1 text-sm font-ui">
                我解出來了
              </ActionButton>
            </div>
          </div>

          <div className="flex-75" />
        </div>
      )}

      {/* ── Step 2：輸入答案 ── */}
      {step === "input" && (
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-5 px-6">
          <div className="w-72 bg-amber-50 border-4 border-amber-800 rounded-lg p-4 shadow-2xl rotate-1 flex flex-col gap-2">
            <p className="text-center font-bold text-amber-900 text-sm font-title">神秘紙條</p>
            <div className="border-t border-amber-300 pt-2 text-center">
              <p className="text-2xl font-black text-amber-900 tracking-[0.3em] font-ui">8 · 5 · 12 · 16</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 w-72">
            <p className="text-amber-200 text-sm font-body">請輸入解碼後的英文單字：</p>
            <div className="flex gap-3 w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="例如：ABCD"
                className="flex-1 rounded-lg border-2 border-amber-700 bg-amber-950 text-amber-100 px-3 py-2 text-base uppercase tracking-widest outline-none focus:border-amber-400 font-ui"
                maxLength={10}
              />
              <ActionButton onClick={handleSubmit} variant="gold" className="min-w-20 text-sm font-ui">
                確認
              </ActionButton>
            </div>
            {error && <p className="text-red-400 text-xs font-ui">答案不對，再對照看看！</p>}
            <ActionButton onClick={() => setStep("note")} variant="ghost" className="text-stone-400 text-xs font-ui">
              回去看對照表
            </ActionButton>
          </div>
        </div>
      )}

      {/* ── Step 3：解謎成功 ── */}
      {step === "solved" && (
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-4 px-6 text-center">
          <p className="text-green-400 font-bold text-lg font-ui">解碼成功</p>
          <p className="text-stone-300 text-sm leading-relaxed font-body max-w-xs">
            答案是「<span className="text-green-300 font-bold">HELP（救命）</span>」——<br />
            一個被困在這裡的孩子留下的求救訊息。
          </p>
          <ActionButton href="/explore" variant="ghost" className="mt-2 px-8 py-2">
            收進背包，返回場景
          </ActionButton>
        </div>
      )}
    </div>
  );
}
