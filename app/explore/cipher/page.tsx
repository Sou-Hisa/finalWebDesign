"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";

const ANSWER = "HELP";

type CipherStep = "note" | "input" | "solved";

export default function ExploreCipher() {
  // const router = useRouter();
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
    <div className="w-full h-screen flex flex-col items-center justify-center bg-amber-950 px-6 gap-5 relative">
      <ActionButton
        href="/explore"
        variant="ghost"
        className="absolute top-4 left-4 text-amber-300 text-sm border border-amber-700 px-3 py-1 hover:bg-amber-800 transition-colors font-ui"
      >
        ← 返回
      </ActionButton>

      {/* 目標說明 */}
      <p className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-stone-400 text-xs font-ui">
        解讀紙條上的數字訊息
      </p>

      {/* Step 1：紙條 + 書桌旁的字母對照表 */}
      {step === "note" && (
        <div className="flex flex-col items-center gap-5 w-full max-w-sm">
          <div className="w-72 bg-amber-50 rounded-lg p-5 shadow-2xl rotate-1 flex flex-col gap-3">
            <p className="text-center font-bold text-amber-900 text-sm font-title">神秘紙條</p>
            <p className="text-xs text-stone-600 leading-relaxed italic font-body">
              字跡歪歪扭扭的，旁邊還畫著奇怪的符號。看起來像是之前被困在這裡的孩子留下的……
            </p>
            <div className="border-t border-amber-300 pt-3 text-center">
              <p className="text-xs text-stone-500 mb-1 font-ui">紙條上寫著：</p>
              <p className="text-3xl font-black text-amber-900 tracking-[0.3em] font-ui">8 · 5 · 12 · 16</p>
            </div>
          </div>

          <div className="w-72 bg-stone-800 border border-amber-50 rounded-lg p-3">
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

          <p className="text-amber-300 text-sm text-center font-body">
            對照看看——8·5·12·16 各對應哪個字母？
          </p>
          <ActionButton
            onClick={() => setStep("input")}
            variant="gold"
            className="border-2 border-amber-500 px-8 py-2 text-amber-300 font-bold font-ui hover:bg-amber-800 hover:text-white transition-colors"
          >
            我解出來了
          </ActionButton>
          <ActionButton
            href="/explore"
            variant="ghost"
            className="text-stone-500 text-xs underline hover:text-stone-300 transition-colors font-ui"
          >
            先去其他地方，待會再回來
          </ActionButton>
        </div>
      )}

      {/* Step 2：輸入答案 */}
      {step === "input" && (
        <div className="flex flex-col items-center gap-5 w-full max-w-sm">
          <div className="w-72 bg-amber-50 border-4 border-amber-800 rounded-lg p-4 shadow-2xl rotate-1 flex flex-col gap-2">
            <p className="text-center font-bold text-amber-900 text-sm font-title">神秘紙條</p>
            <div className="border-t border-amber-300 pt-2 text-center">
              <p className="text-2xl font-black text-amber-900 tracking-[0.3em] font-ui">8 · 5 · 12 · 16</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 w-72">
            <p className="text-amber-200 text-sm font-body">請輸入解碼後的英文單字：</p>
            <div className="flex gap-2 w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="例如：ABCD"
                className="flex-1 rounded-lg border-2 border-amber-50 bg-amber-950 text-amber-100 px-3 py-2 text-base uppercase tracking-widest outline-none focus:border-amber-400 font-ui"
                maxLength={10}
              />
              <ActionButton
                onClick={handleSubmit}
                variant="gold"
                className="border-2 border-amber-500 px-4 py-2 text-amber-300 font-bold font-ui hover:bg-amber-700 hover:text-white transition-colors"
              >
                確認
              </ActionButton>
            </div>
            {error && (
              <p className="text-red-400 text-xs font-ui">答案不對，再對照看看！</p>
            )}
            <ActionButton
              onClick={() => setStep("note")}
              variant="ghost"
              className="mt-1 text-stone-400 text-xs underline hover:text-stone-200 transition-colors font-ui"
            >
              ← 回去看對照表
            </ActionButton>
          </div>
        </div>
      )}

      {/* Step 3：解謎成功 */}
      {step === "solved" && (
        <div className="flex flex-col items-center gap-3 w-72 text-center">
          <p className="text-green-400 font-bold text-base font-ui">解碼成功</p>
          <p className="text-stone-300 text-sm leading-relaxed font-body">
            答案是「<span className="text-green-300 font-bold">HELP（救命）</span>」——<br />
            一個被困在這裡的孩子留下的求救訊息。
          </p>
          <ActionButton
            href="/explore"
            variant="ghost"
            className="mt-2 px-8 py-2"
          >
            收進背包，返回場景
          </ActionButton>
        </div>
      )}
    </div>
  );
}
