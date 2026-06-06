"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../../../store/store";
import ActionButton from "../../../../component/ActionButton";

const ANSWER = "HELP";

type CipherStep = "note" | "input" | "solved";

export default function CenterWallCipherRecipe() {
  const router = useRouter();
  const { addItem } = useGameStore();

  const [step,  setStep]  = useState<CipherStep>("note");
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (step !== "solved") return;
    const t = setTimeout(() => router.push("/explore/center-wall"), 2000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

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
        href="/explore/center-wall"
        variant="ghost"
        className="absolute top-4 left-4 text-amber-300 text-sm border border-amber-700 px-3 py-1 font-ui"
      >
        返回
      </ActionButton>

      {/* Step 1: note (+ cipher table hint if collected) */}
      {step === "note" && (
        <div className="flex flex-col items-center gap-5 w-full max-w-sm">
          <div className="w-full bg-amber-50 rounded-lg p-5 shadow-2xl rotate-1 flex flex-col gap-3">
            <p className="text-center font-bold text-amber-900 text-sm font-title">神秘紙條</p>
            <p className="text-xs text-stone-600 leading-relaxed italic font-body">
              字跡歪歪扭扭的，旁邊還畫著奇怪的符號。看起來像是之前被困在這裡的孩子留下的……
            </p>
            <div className="border-t border-amber-300 pt-3 text-center">
              <p className="text-xs text-stone-500 mb-1 font-ui">紙條上寫著：</p>
              <p className="text-3xl font-black text-amber-900 tracking-[0.1em] font-ui">8 · 5 · 12 · 16</p>
            </div>
          </div>


          <p className="text-amber-300 text-sm text-center font-body">
            8·5·12·16 各對應哪個字母？
          </p>
          <div className="w-full flex flex-row flex-nowrap items-center gap-4">
            <ActionButton
              onClick={() => setStep("input")}
              variant="gold"
              className="flex-1 px-6 py-2 text-sm font-bold text-amber-300 font-ui"
            >
              我解出來了
            </ActionButton>
          </div>
        </div>
      )}

      {/* Step 2: input answer */}
      {step === "input" && (
        <div className="flex flex-col justify-center items-center gap-5 w-full max-w-sm">
          <div className="w-full bg-amber-50 border-4 border-amber-800 rounded-lg p-4 shadow-2xl rotate-1 flex flex-col gap-2">
            <p className="text-center font-bold text-amber-900 text-sm font-title">神秘紙條</p>
            <div className="border-t border-amber-300 pt-2 text-center">
              <p className="text-2xl font-black text-amber-900 tracking-[0.3em] font-ui">8 · 5 · 12 · 16</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-5 w-72">
            <p className="text-amber-200 text-sm font-body">請輸入解碼後的英文單字：</p>
            <div className="flex gap-3 w-full">
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
                className="min-w-20 whitespace-nowrap border-2 border-amber-500 px-6 py-2 text-sm text-amber-300 font-bold font-ui"
              >
                確認
              </ActionButton>
            </div>
            {error && (
              <p className="text-red-400 text-xs font-ui">答案不對，再對照看看！</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: solved */}
      {step === "solved" && (
        <div className="flex flex-col items-center gap-5 w-72 text-center">
          <p className="text-green-400 font-bold text-base font-ui">解碼成功</p>
          <p className="text-stone-300 text-sm leading-relaxed font-body">
            答案是 <span className="text-green-300 font-bold">HELP</span> ——<br />
            一個被困在這裡的孩子留下的求救訊息
          </p>
          <p className="text-stone-500 text-xs font-body">這竟是誰留下的訊息……</p>
        </div>
      )}
    </div>
  );
}
