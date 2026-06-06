"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";

type WandStep = "box" | "puzzle" | "collected";
type Tile = number | null; // null = 空格

const SIZE   = 3;
const SOLVED: Tile[] = [1, 2, 3, 4, 5, 6, 7, 8, null];

function getNeighbors(idx: number): number[] {
  const row = Math.floor(idx / SIZE);
  const col = idx % SIZE;
  const ns: number[] = [];
  if (row > 0)          ns.push(idx - SIZE);
  if (row < SIZE - 1)   ns.push(idx + SIZE);
  if (col > 0)          ns.push(idx - 1);
  if (col < SIZE - 1)   ns.push(idx + 1);
  return ns;
}

function shuffleTiles(base: Tile[], moves = 220): Tile[] {
  const s = [...base];
  let emptyIdx = s.indexOf(null);
  for (let i = 0; i < moves; i++) {
    const ns = getNeighbors(emptyIdx);
    const pick = ns[Math.floor(Math.random() * ns.length)];
    [s[emptyIdx], s[pick]] = [s[pick], s[emptyIdx]];
    emptyIdx = pick;
  }
  return s;
}

function isSolved(tiles: Tile[]): boolean {
  return SOLVED.every((v, i) => v === tiles[i]);
}

export default function ExploreWand() {
  const { addItem, collectedItems } = useGameStore();
  const alreadyCollected = collectedItems.includes("wand");

  const [step,    setStep]    = useState<WandStep>(alreadyCollected ? "collected" : "box");
  const [tiles,   setTiles]   = useState<Tile[]>(() => shuffleTiles(SOLVED));
  const [moves,   setMoves]   = useState(0);
  const [solved,  setSolved]  = useState(false);

  // 過關偵測
  useEffect(() => {
    if (step === "puzzle" && !solved && isSolved(tiles)) {
      setSolved(true);
      setTimeout(() => { addItem("wand"); setStep("collected"); }, 900);
    }
  }, [tiles, step, solved, addItem]);

  function handleTileClick(idx: number) {
    if (solved) return;
    const emptyIdx = tiles.indexOf(null);
    if (!getNeighbors(emptyIdx).includes(idx)) return;
    const next = [...tiles];
    [next[emptyIdx], next[idx]] = [next[idx], next[emptyIdx]];
    setTiles(next);
    setMoves(m => m + 1);
  }

  function resetPuzzle() {
    setTiles(shuffleTiles(SOLVED));
    setMoves(0);
    setSolved(false);
  }

  return (
    <div className="w-full h-screen flex flex-col items-center bg-black relative overflow-hidden">

      {/* 背景圖：/public/images/bg_wand.png（中央牆－機關木盒區） */}
      <div className="absolute inset-0 bg-[url('/images/bg_wand.png')] bg-cover bg-center bg-no-repeat bg-stone-950" />
      <div className="absolute inset-0 bg-black/60" />

      {/* 返回按鈕 */}
      <ActionButton
        href="/explore"
        variant="ghost"
        className="absolute top-4 left-4 z-20 text-stone-400 text-sm border border-stone-700 px-3 py-1 font-ui"
      >
        ← 返回
      </ActionButton>

      {/* 目標提示 */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-stone-500 text-xs font-ui">
        解開機關，打開木盒
      </p>

      {/* ── Step 1：開場，看見木盒 ── */}
      {step === "box" && (
        <div className="relative z-10 flex flex-col items-center w-full h-full">
          <div className="flex-25" />

          {/* 大字場景敘事 */}
          <div className="w-full max-w-2xl px-8 flex flex-col gap-2 mb-10">
            <p className="font-title font-bold text-4xl text-white/90 leading-snug">
              牆角擺著一個帶有機關的木盒，
            </p>
            <p className="font-title font-bold text-4xl text-white/60 leading-snug">
              表面刻著複雜的圖案……
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            {/* 木盒佔位圖 */}
            <div
              className="w-36 h-28 bg-stone-800 border-2 border-stone-600 flex items-center justify-center text-xs text-stone-400 font-ui"
              style={{ boxShadow: "0 0 20px rgba(0,0,0,0.6)" }}
            >
              [機關木盒 圖]
            </div>
            <ActionButton
              onClick={() => setStep("puzzle")}
              variant="ghost"
              className="border-2 border-amber-700 px-8 py-2 text-amber-300 font-bold font-ui"
            >
              試著撥動機關
            </ActionButton>
          </div>

          <div className="flex-75" />
        </div>
      )}

      {/* ── Step 2：滑塊拼圖 ── */}
      {step === "puzzle" && (
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-5 px-4">

          <p className="font-title font-bold text-2xl text-white/80 text-center">
            將圖案拼回原樣，解開機關
          </p>

          {/* 拼圖格 */}
          <div
            className="grid gap-1.5 p-2 bg-stone-900/80 border border-stone-600 rounded-lg"
            style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, width: 264 }}
          >
            {tiles.map((tile, idx) => (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                disabled={tile === null}
                className={`
                  w-20 h-20 rounded font-title font-bold text-3xl
                  transition-all duration-100 select-none
                  ${tile === null
                    ? "bg-stone-950 cursor-default"
                    : solved
                      ? "bg-amber-600 text-white border border-amber-400 cursor-default"
                      : "bg-amber-900 text-amber-100 border border-amber-700 hover:bg-amber-800 hover:border-amber-500 active:scale-95 cursor-pointer"
                  }
                `}
              >
                {tile ?? ""}
              </button>
            ))}
          </div>

          {/* 步數 + 重置 */}
          <div className="flex items-center gap-6">
            <span className="text-stone-400 text-sm font-ui">步數：{moves}</span>
            <button
              onClick={resetPuzzle}
              className="text-stone-500 text-xs font-ui border border-stone-700 px-3 py-1 hover:text-stone-300 hover:border-stone-500 transition-colors"
            >
              重新打亂
            </button>
          </div>

          {solved && (
            <p className="text-amber-300 font-title font-bold text-xl animate-pulse">
              機關解除——
            </p>
          )}
        </div>
      )}

      {/* ── Step 3：木盒打開，發現食譜 ── */}
      {step === "collected" && (
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full gap-5 text-center px-6">
          <div
            className="w-36 h-28 bg-amber-900 border-2 border-amber-500 flex items-center justify-center text-xs text-amber-300 font-ui"
            style={{ boxShadow: "0 0 24px rgba(217,119,6,0.4)" }}
          >
            [木盒已開 圖]
          </div>
          <p className="text-green-400 font-bold text-lg font-ui">機關解除，木盒打開了</p>
          <div className="bg-red-950/60 border border-red-800 rounded-lg p-4 max-w-xs text-left">
            <p className="text-red-300 text-sm font-title font-bold text-center mb-2">
              《如何製作香甜鮮嫩的小孩》
            </p>
            <p className="text-red-400/80 text-xs font-body leading-relaxed">
              材料：男孩一名、女孩一名、糖果、香料<br />
              <span className="text-stone-500">注意：不要讓孩子發現。</span>
            </p>
          </div>
          <ActionButton href="/explore" variant="ghost" className="mt-2 px-8 py-2">
            收進背包，返回場景
          </ActionButton>
        </div>
      )}
    </div>
  );
}
