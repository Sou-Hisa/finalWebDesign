"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Img from "next/image";
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
    desc: "細長均衡，四肢比例對稱，頭骨偏圓，整體輕薄",
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
        <p className="text-gray-300 font-bold text-base font-ui">骨頭證據已收集</p>
        <p className="text-stone-400 text-sm font-body">已確認是人類小孩的骨頭……</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black px-6 gap-6 relative overflow-hidden">
      <Img
        src="/images/explore_middle.png"
        alt="center_wall"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none opacity-35 blur-xs"
      />

{step === "inspect" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-fade-in">
          <Img
            src="/item_images/Book.png"
            alt="百科全書背景"
            width={850}
            height={750}
            loading="eager"
            className="object-contain drop-shadow-[0_0_40px_rgba(251,191,36,0.3)] transform -translate-y-15" 
          />
        </div>
      )}

      <ActionButton
        href="/explore/center-wall"
        variant="back"
        className="absolute top-4 left-4 z-20"
      >
        ← 返回
      </ActionButton>


      {/* ── Step: inspect ── */}
      {step === "inspect" && (
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl mb-6 p-10 transform translate-y-60">
          <ActionButton
            onClick={() => setStep("compare")}
            variant="gold"
            className="w-full"
          >
            開始比對箱子裡的是誰的骨頭
          </ActionButton>
        </div>
      )}

      {/* ── Step: compare ── */}
      {step === "compare" && (
        <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-2xl mx-8 rounded-xl p-10 bg-stone-950/92 border border-amber-900/50 shadow-[0_0_60px_rgba(0,0,0,0.95)]">
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
                  variant="white"
                  className={`w-full text-left border! rounded-lg p-4 transition-all ${
                    isSelected
                      ? "border-amber-500! bg-amber-950/60!"
                      : "border-stone-700! bg-stone-900/60! hover:border-amber-500!"
                  } group`}
                >
                  <div className="flex flex-col justify-center items-center">
                    <p className={`font-bold text-sm font-ui ${isSelected ? "text-amber-300" : "text-stone-200 group-hover:text-stone-100"}`}>
                      {opt.label}
                    </p>
                    <p className={`text-xs mt-1 font-body ${isSelected ? "text-amber-100" : "text-stone-300 group-hover:text-stone-100"}`}>
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
              variant="white"
              className="flex-1 px-6 py-2 text-sm font-bold text-stone-500 font-ui"
            >
              回去看骨頭特徵
            </ActionButton>
            <ActionButton
              onClick={handleConfirm}
              variant="gold"
              disabled={!selected || !!correctConfirmed}
              className="flex-1 px-6 py-2 text-sm font-bold font-ui disabled:opacity-40 disabled:cursor-not-allowed"
            >
              確認比對
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
}
