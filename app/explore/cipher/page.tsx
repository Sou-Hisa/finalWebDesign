"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../../store/store";

// A=1, B=2, …, Z=26　→　8-5-12-16 = HELP
const ANSWER = "HELP";

export default function ExploreCipher() {
  const router = useRouter();
  const { addItem, collectedItems } = useGameStore();
  const alreadyCollected = collectedItems.includes("note");

  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [solved, setSolved] = useState(alreadyCollected);

  function handleSubmit() {
    if (input.toUpperCase().trim() === ANSWER) {
      setSolved(true);
      setError(false);
      addItem("note");
    } else {
      setError(true);
    }
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-amber-950 px-6 gap-6">
      {/* 返回按鈕 */}
      <button
        onClick={() => router.push("/explore")}
        className="absolute top-4 left-4 text-amber-300 text-sm border border-amber-700 px-3 py-1 hover:bg-amber-800 transition-colors"
      >
        ← 返回
      </button>

      {/* 紙條視覺 */}
      <div className="w-72 bg-amber-50 border-4 border-amber-800 rounded p-5 shadow-2xl rotate-1 flex flex-col gap-3">
        <p className="text-center font-bold text-amber-900 text-base">📜 神秘紙條</p>
        <p className="text-xs text-stone-600 leading-relaxed italic">
          這張紙條上的字跡歪歪扭扭的，旁邊還畫著奇怪的符號。看起來像是前一個來到這裡的小孩留下的……
        </p>
        <div className="border-t border-amber-300 pt-3 text-center">
          <p className="text-xs text-stone-500 mb-1">紙條上寫著：</p>
          <p className="text-3xl font-black text-amber-900 tracking-[0.3em]">8 · 5 · 12 · 16</p>
        </div>
      </div>

      {/* 密碼表提示 */}
      <div className="w-72 bg-stone-800 border border-stone-600 rounded p-3 text-xs text-stone-300 text-center">
        <p className="font-bold text-amber-300 mb-2">密碼表（A=1, B=2, C=3…）</p>
        <div className="grid grid-cols-13 gap-x-2 gap-y-0.5 font-mono text-[10px] text-center">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch, i) => (
            <span key={ch} className="text-stone-400">
              {ch}
              <br />
              <span className="text-amber-400">{i + 1}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 解謎輸入 */}
      {!solved ? (
        <div className="flex flex-col items-center gap-3 w-72">
          <p className="text-amber-200 text-sm">請輸入解碼後的英文單字：</p>
          <div className="flex gap-2 w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="例如：ABCD"
              className="flex-1 border-2 border-amber-700 bg-amber-950 text-amber-100 px-3 py-2 text-base uppercase tracking-widest outline-none focus:border-amber-400"
              maxLength={10}
            />
            <button
              onClick={handleSubmit}
              className="border-2 border-amber-500 px-4 py-2 text-amber-300 font-bold hover:bg-amber-700 hover:text-white transition-colors"
            >
              確認
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-xs">❌ 答案不對，再對照密碼表試試！</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 w-72 text-center">
          <p className="text-green-400 font-bold text-base">✅ 解碼成功！</p>
          <p className="text-stone-300 text-sm leading-relaxed">
            答案是「<span className="text-green-300 font-bold">HELP（救命）</span>」——<br />
            一個被困在這裡的孩子留下的求救訊息。
          </p>
          <button
            onClick={() => router.push("/explore")}
            className="mt-2 border-2 border-green-600 px-8 py-2 font-bold text-green-400 hover:bg-green-700 hover:text-white transition-colors"
          >
            收進背包，返回場景
          </button>
        </div>
      )}
    </div>
  );
}
