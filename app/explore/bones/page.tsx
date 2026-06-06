"use client";

import { useState } from "react";
import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";

const BONE_OPTIONS = [
  {
    id: "animal_small",
    label: "小型動物骨架",
    desc: "短而纖細，前後肢比例不均，骨骼密度較高",
    correct: false,
    msg: "骨頭的長度和比例對不上——這是小動物的骨架",
  },
  {
    id: "human_child",
    label: "人類幼童骨架",
    desc: "細長均勻，四肢比例對稱，頭骨偏圓，整體輕薄",
    correct: true,
    msg: "比例完全吻合——箱子裡的骨頭，是人類小孩的",
  },
  {
    id: "animal_large",
    label: "大型動物骨架",
    desc: "粗壯厚實，骨骼明顯彎曲，蹄骨清晰可辨",
    correct: false,
    msg: "骨頭太細，完全不是這個量級的動物",
  },
];

type ActiveModal = null | "encyclopedia" | "cipher";

export default function ExploreCenterWall() {
  const { addItem, collectedItems } = useGameStore();
  const bonesCollected = collectedItems.includes("bones");
  const hasCipherTable  = collectedItems.includes("wand");

  const [modal,         setModal]         = useState<ActiveModal>(null);
  const [selected,      setSelected]      = useState<string | null>(null);
  const [confirmed,     setConfirmed]     = useState(false);
  const [compareResult, setCompareResult] = useState<string | null>(null);

  function handleCompareConfirm() {
    if (!selected || confirmed) return;
    const opt = BONE_OPTIONS.find((o) => o.id === selected)!;
    setCompareResult(opt.msg);
    setConfirmed(true);
    if (opt.correct) addItem("bones");
  }

  function closeModal() {
    setModal(null);
    setSelected(null);
    setConfirmed(false);
    setCompareResult(null);
  }

  const correctAnswer = confirmed && BONE_OPTIONS.find((o) => o.id === selected)?.correct;

  return (
    <div className="w-full h-screen relative overflow-hidden bg-stone-900">
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-600/30 to-stone-900 pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-stone-600/30 text-xs font-ui select-none">[中間牆壁 背景佔位]</span>
      </div>

      {/* Return */}
      <ActionButton
        href="/explore"
        variant="ghost"
        className="absolute top-4 right-4 z-20 text-stone-400 text-sm border border-stone-700 px-3 py-1 font-ui"
      >
        返回
      </ActionButton>

      {/* ── Room scene: bookshelf items ── */}
      <div className="relative z-10 w-full h-full flex items-center justify-center gap-16 pb-12">
        {/* Encyclopedia */}
        <button
          onClick={() => { if (!bonesCollected) setModal("encyclopedia"); }}
          className="flex flex-col items-center gap-2 group"
        >
          <div
            className={`w-20 h-28 border-2 flex items-center justify-center text-xs font-ui rounded transition-colors
              ${bonesCollected
                ? "bg-stone-800/60 border-stone-700 text-stone-600 cursor-default"
                : "bg-stone-700 border-stone-500 text-stone-400 group-hover:border-amber-400"}`}
          >
            [百科全書]
          </div>
          <span
            className={`text-xs font-ui transition-colors
              ${bonesCollected ? "text-stone-600" : "text-stone-500 group-hover:text-amber-300"}`}
          >
            {bonesCollected ? "✓ 已對照" : "百科全書"}
          </span>
        </button>

        {/* Cipher recipe */}
        <button
          onClick={() => setModal("cipher")}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="w-16 h-20 bg-stone-700 border-2 border-stone-500 group-hover:border-red-400 transition-colors flex items-center justify-center text-xs text-stone-400 font-ui rounded">
            [密碼食譜]
          </div>
          <span className="text-xs text-stone-500 group-hover:text-red-300 font-ui transition-colors">密碼食譜</span>
        </button>
      </div>

      {/* ── Modal: Encyclopedia / Bones comparison ── */}
      {modal === "encyclopedia" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md mx-4 bg-stone-800 border border-stone-600 rounded-lg overflow-hidden shadow-2xl">
            {/* Image placeholder */}
            <div className="w-full h-32 bg-stone-600 border-b border-stone-700 flex items-center justify-center text-stone-400 text-xs font-ui">
              [百科全書插圖]
            </div>

            {/* Item label */}
            <div className="px-4 py-2 bg-stone-700 text-center border-b border-stone-600">
              <span className="text-stone-300 text-xs font-ui">打開的百科全書（裡面裝滿各種骨頭）</span>
            </div>

            <div className="p-4">
              <p className="text-stone-300 text-sm font-body leading-relaxed mb-3">
                書架上蒐集了多個動物的骨骼與牠們的特徵，找到箱子裡的骨頭符合哪一個選項：
              </p>

              {/* Options */}
              <div className="flex flex-col gap-2 mb-3">
                {BONE_OPTIONS.map((opt) => {
                  const isSelected = selected === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => { if (!confirmed) { setSelected(opt.id); setCompareResult(null); } }}
                      className={`text-left border-2 rounded-lg p-3 transition-all ${
                        isSelected
                          ? "border-amber-400 bg-amber-950/40"
                          : "border-stone-600 bg-stone-900/40 hover:border-stone-400"
                      }`}
                    >
                      <p className={`font-bold text-xs font-ui ${isSelected ? "text-amber-300" : "text-stone-200"}`}>
                        {opt.label}
                      </p>
                      <p className={`text-xs mt-0.5 font-body ${isSelected ? "text-amber-100" : "text-stone-400"}`}>
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Result message */}
              {compareResult && (
                <p
                  className={`text-xs text-center font-body px-3 py-2 border rounded mb-3 ${
                    correctAnswer
                      ? "text-red-400 border-red-700 bg-red-950/40"
                      : "text-stone-400 border-stone-700 bg-stone-900/40"
                  }`}
                >
                  {compareResult}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <ActionButton
                  onClick={closeModal}
                  variant="ghost"
                  className="flex-1 text-sm font-ui text-stone-500 py-1"
                >
                  {correctAnswer ? "關閉" : "放回去"}
                </ActionButton>
                <ActionButton
                  onClick={handleCompareConfirm}
                  disabled={!selected || confirmed}
                  className="flex-1 text-sm font-bold font-ui border-2 border-red-600 text-red-400 hover:bg-red-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed py-1"
                >
                  確認比對
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Cipher recipe ── */}
      {modal === "cipher" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm mx-4 bg-stone-800 border border-stone-600 rounded-lg overflow-hidden shadow-2xl">
            <div className="w-full h-36 bg-stone-600 border-b border-stone-700 flex items-center justify-center text-stone-400 text-xs font-ui">
              [密碼食譜圖片]
            </div>
            <div className="px-4 py-2 bg-stone-700 text-center border-b border-stone-600">
              <span className="text-stone-300 text-xs font-ui">一張寫滿符號的紙條</span>
            </div>
            <div className="p-4">
              {hasCipherTable ? (
                <>
                  <p className="text-stone-300 text-sm font-body leading-relaxed mb-1">
                    對照密碼表，你辨認出了幾個字——
                  </p>
                  <p className="text-red-300 text-center text-2xl font-bold my-3 font-title">&ldquo;Help me&rdquo;</p>
                  <p className="text-stone-400 text-xs font-body text-center mb-3">
                    這竟是誰留下的訊息……
                  </p>
                </>
              ) : (
                <p className="text-stone-400 text-sm font-body leading-relaxed mb-3">
                  不知道這張紙在幹嘛……上面全是奇怪的符號，完全看不懂。也許有什麼對照工具能幫上忙？
                </p>
              )}
              <div className="flex justify-center">
                <ActionButton
                  onClick={closeModal}
                  variant="ghost"
                  className="px-8 py-2 text-stone-300 font-ui"
                >
                  確認
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backpack bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-2 bg-stone-900/95 border-t border-stone-700 flex items-center gap-3 h-12">
        <span className="text-xs font-ui text-stone-500">背包</span>
        {collectedItems.includes("box")   && <span className="text-xl" title="舊箱子">📦</span>}
        {collectedItems.includes("bones") && <span className="text-xl" title="白色骨頭">🦴</span>}
        {collectedItems.includes("wand")  && <span className="text-xl" title="密碼表">📜</span>}
      </div>
    </div>
  );
}
