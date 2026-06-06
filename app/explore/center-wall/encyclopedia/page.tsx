"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../../../store/store";
import ActionButton from "../../../../component/ActionButton";

const BONE_OPTIONS = [
  {
    id: "animal_small",
    label: "小型動物骨骼",
    desc: "短而纖細，前後肢比例不均",
    correct: false,
    msg: "骨頭的長度和比例對不上——這是小動物的骨骼",
  },
  {
    id: "human_child",
    label: "人類幼童骨骼",
    desc: "細長均勻，四肢比例對稱，頭骨偏圓，整體輕薄",
    correct: true,
    msg: "比例完全吻合——箱子裡的骨頭，是人類小孩的",
  },
  {
    id: "animal_large",
    label: "大型動物骨骼",
    desc: "粗壯厚實，骨骼明顯彎曲，蹄骨清晰可辨",
    correct: false,
    msg: "骨頭太細，完全不是這個量級的動物",
  },
];

type Step = "inspect" | "compare";

export default function CenterWallEncyclopedia() {
  const router = useRouter();
  const { addItem, collectedItems } = useGameStore();
  const alreadyCollected = collectedItems.includes("bones");

  const [step,      setStep]      = useState<Step>("inspect");
  const [selected,  setSelected]  = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const correctConfirmed = confirmed && BONE_OPTIONS.find((o) => o.id === selected)?.correct;

  function handleOptionClick(id: string) {
    if (correctConfirmed) return; // 答對後鎖住，不能重選
    setSelected(id);
    setResultMsg(null);
    setConfirmed(false); // 答錯後重選，重置確認狀態
  }

  function handleConfirm() {
    if (!selected || confirmed) return;
    const opt = BONE_OPTIONS.find((o) => o.id === selected)!;
    setResultMsg(opt.msg);
    setConfirmed(true);
    if (opt.correct) {
      addItem("bones");
      setTimeout(() => router.push("/explore/center-wall"), 2000);
    }
  }

  /* ── Already collected ── */
  if (alreadyCollected) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-950 px-6 gap-5">
        <p className="text-green-400 font-bold text-base font-ui">骨頭證據已收集</p>
        <p className="text-stone-400 text-sm font-body">已確認是人類小孩的骨頭……</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-950 px-6 gap-6 relative">
      <ActionButton
        href="/explore/center-wall"
        variant="ghost"
        className="absolute top-4 left-4 text-stone-400 text-sm border border-stone-700 px-3 py-1 font-ui"
      >
        返回
      </ActionButton>


      {/* ── Step: inspect ── */}
      {step === "inspect" && (
        <div className="flex flex-col items-center gap-5 max-w-sm text-center">
          <div className="bg-stone-800 border border-stone-600 rounded-lg p-4 text-left text-sm text-stone-300 leading-relaxed font-body">
            <p>骨頭百科全書[圖片]</p>
          </div>
          <ActionButton
            onClick={() => setStep("compare")}
            variant="red"
            className="border-2 border-red-600 px-8 py-2 text-red-400 font-bold font-ui"
          >
            開始比對箱子裡的是誰的骨頭
          </ActionButton>
        </div>
      )}

      {/* ── Step: compare ── */}
      {step === "compare" && (
        <div className="flex flex-col items-center gap-5 w-full max-w-md">
          <p className="text-stone-300 text-sm text-center font-body">
            看完書架上的《骨頭百科全書》與對照箱子裡的骨頭後<br />
            <span className="text-amber-300">根據你觀察到的特徵，選出符合的骨骼類型</span>
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
                  } group`}
                >
                  <div className="flex flex-col justify-center items-center">
                    <p className={`font-bold text-sm font-ui ${isSelected ? "text-amber-300" : "text-stone-200 group-hover:text-stone-100"}`}>
                      {opt.label}
                    </p>
                    <p className={`text-xs mt-1 font-body ${isSelected ? "text-amber-100" : "text-stone-400 group-hover:text-stone-200"}`}>
                      {opt.desc}
                    </p>
                  </div>
                </ActionButton>
              );
            })}
          </div>

          {resultMsg && (() => {
            const opt = BONE_OPTIONS.find((o) => o.id === selected)!;
            return (
              <p className={`text-sm text-center font-body px-4 py-2 border rounded-lg ${
                opt.correct
                  ? "text-red-400 border-red-700 bg-red-950/40"
                  : "text-stone-400 border-stone-700 bg-stone-900/40"
              }`}>
                {resultMsg}
                {opt.correct && <span className="block text-xs text-stone-500 mt-1">自動返回中……</span>}
              </p>
            );
          })()}

          <div className="w-full flex flex-row flex-nowrap items-center justify-between gap-4">
            <ActionButton
              onClick={() => setStep("inspect")}
              variant="ghost"
              className="flex-1 px-6 py-2 text-sm font-bold text-stone-500 font-ui"
            >
              回去看骨頭特徵
            </ActionButton>
            <ActionButton
              onClick={handleConfirm}
              disabled={!selected || !!correctConfirmed}
              className="flex-1 px-6 py-2 text-sm font-bold font-ui border-2 border-red-600 text-red-400 hover:bg-red-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              確認比對
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
}
