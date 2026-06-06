"use client";

import { useState } from "react";
import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";

type Step = "box" | "inspect" | "compare" | "done";

const BONE_OPTIONS = [
  {
    id: "animal_small",
    label: "小型動物骨架",
    desc: "短而纖細，前後肢比例不均，骨骼密度較高。",
    correct: false,
    msg: "骨頭的長度和比例對不上——這是小動物的骨架。",
  },
  {
    id: "human_child",
    label: "人類幼童骨架",
    desc: "細長均勻，四肢比例對稱，頭骨偏圓，整體輕薄。",
    correct: true,
    msg: "比例完全吻合——箱子裡的骨頭，是人類小孩的。",
  },
  {
    id: "animal_large",
    label: "大型動物骨架",
    desc: "粗壯厚實，骨骼明顯彎曲，蹄骨清晰可辨。",
    correct: false,
    msg: "骨頭太細，完全不是這個量級的動物。",
  },
];

export default function ExploreBones() {
  const { addItem, collectedItems } = useGameStore();
  const alreadyCollected = collectedItems.includes("bones");

  const [step,       setStep]       = useState<Step>(alreadyCollected ? "done" : "box");
  const [selected,   setSelected]   = useState<string | null>(null);
  const [confirmed,  setConfirmed]  = useState(false);

  function collect() { addItem("bones"); }

  function handleOptionClick(id: string) {
    setSelected(id);
    setConfirmed(false);
  }

  function handleConfirm() {
    if (!selected) return;
    const opt = BONE_OPTIONS.find((o) => o.id === selected)!;
    setConfirmed(true);
    if (opt.correct) { collect(); setTimeout(() => setStep("done"), 1400); }
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-950 px-6 gap-6 relative">
      <ActionButton
        href="/explore"
        variant="ghost"
        className="absolute top-4 left-4 text-stone-400 text-sm border border-stone-700 px-3 py-1 hover:bg-stone-800 transition-colors font-ui"
      >
        ← 返回
      </ActionButton>

      {/* 目標說明 */}
      <p className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-stone-400 text-xs font-ui">
        確認箱子裡的東西究竟是什麼，蒐集可用的證據
      </p>

      {/* Step 1：看到箱子 */}
      {step === "box" && (
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <div className="w-24 h-24 bg-stone-700 border border-stone-500 flex items-center justify-center text-xs text-stone-400 font-ui">
            [舊箱子 圖]
          </div>
          <p className="text-stone-200 text-base leading-relaxed font-body">
            角落裡有一個滿是灰塵的舊箱子。<br />蓋子半開著，從縫隙裡透出一股詭異的氣息……
          </p>
          <ActionButton
            onClick={() => setStep("inspect")}
            variant="ghost"
            className="border-2 border-stone-400 px-8 py-2 text-stone-200 font-bold font-ui hover:bg-stone-700 transition-colors"
          >
            打開箱子
          </ActionButton>
        </div>
      )}

      {/* Step 2：發現骨頭 */}
      {step === "inspect" && (
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <div className="flex gap-2 items-center">
            <div className="w-20 h-6 bg-gray-400 border border-gray-300 rounded-full" />
            <div className="w-16 h-5 bg-gray-500 border border-gray-300 rounded-full" />
            <div className="w-20 h-6 bg-gray-400 border border-gray-300 rounded-full" />
          </div>
          <div className="bg-stone-800 border border-stone-600 rounded-lg p-4 text-left text-sm text-stone-300 leading-relaxed font-body">
            <p>箱子裡裝著一些奇怪的白色長條物……</p>
            <p className="mt-2 text-red-400 font-bold">等等，這好像是骨頭？</p>
            <p className="mt-2">仔細看：<span className="text-amber-300">細長均勻，四肢比例對稱，頭骨碎片偏圓，整體輕薄。</span></p>
            <p className="mt-2">走到旁邊的書架，把骨頭和圖鑑對照看看——</p>
          </div>
          <ActionButton
            onClick={() => setStep("compare")}
            variant="red"
            className="border-2 border-red-600 px-8 py-2 text-red-400 font-bold font-ui hover:bg-red-900 transition-colors"
          >
            走向書架對照
          </ActionButton>
        </div>
      )}

      {/* Step 3：比對骨骼圖鑑 */}
      {step === "compare" && (
        <div className="flex flex-col items-center gap-5 w-full max-w-md">
          <p className="text-stone-300 text-sm text-center font-body">
            書架上擺著《骨骼圖鑑》，翻到對照頁。<br />
            <span className="text-amber-300">根據你觀察到的特徵，選出符合的骨架類型：</span>
          </p>

          <div className="w-full flex flex-col gap-3">
            {BONE_OPTIONS.map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <ActionButton
                  key={opt.id}
                  onClick={() => handleOptionClick(opt.id)}
                  className={`w-full text-left border-2 rounded-lg p-4 transition-all ${
                    isSelected
                      ? "border-amber-400 bg-amber-950/40"
                      : "border-stone-600 bg-stone-900/40 hover:border-stone-400"
                  }`}
                >
                  <p className={`font-bold text-sm font-ui ${isSelected ? "text-amber-300" : "text-stone-200"}`}>
                    {opt.label}
                  </p>
                  <p className="text-stone-400 text-xs mt-1 font-body">{opt.desc}</p>
                </ActionButton>
              );
            })}
          </div>

          {confirmed && selected && (() => {
            const opt = BONE_OPTIONS.find((o) => o.id === selected)!;
            return (
              <p className={`text-sm text-center font-body px-4 py-2 border rounded-lg ${
                opt.correct
                  ? "text-red-400 border-red-700 bg-red-950/40"
                  : "text-stone-400 border-stone-700 bg-stone-900/40"
              }`}>
                {opt.msg}
              </p>
            );
          })()}

          <ActionButton
            onClick={handleConfirm}
            disabled={!selected || confirmed}
            className="border-2 border-red-600 px-8 py-2 text-red-400 font-bold font-ui hover:bg-red-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            確認比對
          </ActionButton>

          <ActionButton
            onClick={() => setStep("inspect")}
            variant="ghost"
            className="text-stone-500 text-xs underline hover:text-stone-300 transition-colors font-ui"
          >
            ← 回去看骨頭特徵
          </ActionButton>
        </div>
      )}

      {/* Step done */}
      {step === "done" && (
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <div className="w-20 h-6 bg-gray-400 border border-gray-300 rounded-full" />
          <p className="text-green-400 font-bold text-base font-ui">骨頭證據已收集</p>
          <p className="text-stone-400 text-sm font-body">已確認是人類小孩的骨頭……</p>
          <ActionButton
            href="/explore"
            variant="ghost"
            className="px-8 py-2"
          >
            返回場景
          </ActionButton>
        </div>
      )}
    </div>
  );
}
