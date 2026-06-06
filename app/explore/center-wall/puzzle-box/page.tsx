"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../../../store/store";
import ActionButton from "../../../../component/ActionButton";

type BoxStep = "inspect" | "puzzle" | "solved";

const SIZE = 3;

function generatePuzzle(): number[] {
  const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  let emptyIdx = 8;
  for (let i = 0; i < 120; i++) {
    const row = Math.floor(emptyIdx / SIZE);
    const col = emptyIdx % SIZE;
    const moves: number[] = [];
    if (row > 0) moves.push(emptyIdx - SIZE);
    if (row < SIZE - 1) moves.push(emptyIdx + SIZE);
    if (col > 0) moves.push(emptyIdx - 1);
    if (col < SIZE - 1) moves.push(emptyIdx + 1);
    const next = moves[Math.floor(Math.random() * moves.length)];
    [tiles[emptyIdx], tiles[next]] = [tiles[next], tiles[emptyIdx]];
    emptyIdx = next;
  }
  return tiles;
}

function checkSolved(tiles: number[]): boolean {
  return tiles.every((v, i) => v === (i === SIZE * SIZE - 1 ? 0 : i + 1));
}

export default function PuzzleBox() {
  const router = useRouter();
  const { addItem, collectedItems } = useGameStore();
  const alreadySolved = collectedItems.includes("puzzle");

  const [step, setStep] = useState<BoxStep>(alreadySolved ? "solved" : "inspect");
  const [tiles, setTiles] = useState<number[]>(() => generatePuzzle());

  function handleTileClick(idx: number) {
    if (step !== "puzzle") return;
    const emptyIdx = tiles.indexOf(0);
    const r = Math.floor(idx / SIZE), c = idx % SIZE;
    const er = Math.floor(emptyIdx / SIZE), ec = emptyIdx % SIZE;
    const adjacent = (Math.abs(r - er) === 1 && c === ec) || (Math.abs(c - ec) === 1 && r === er);
    if (!adjacent) return;

    const next = [...tiles];
    [next[idx], next[emptyIdx]] = [next[emptyIdx], next[idx]];
    setTiles(next);

    if (checkSolved(next)) {
      addItem("puzzle");
      setStep("solved");
    }
  }

  /* ── inspect ── */
  if (step === "inspect") {
    return (
      <div className="w-full h-screen relative flex flex-col items-center justify-center gap-6 bg-stone-900 px-6">
        <ActionButton
          href="/explore/center-wall"
          variant="ghost"
          className="absolute top-4 left-4 text-stone-400 text-sm border border-stone-700 px-3 py-1 font-ui"
        >
          返回
        </ActionButton>

        <div className="w-full max-w-sm bg-stone-800 border border-stone-600 rounded-lg p-6 flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-24 h-16 bg-stone-700 border-2 border-stone-500 rounded flex items-center justify-center text-xs font-ui text-stone-400">
            [木盒圖片]
          </div>
          <p className="text-stone-300 text-sm font-body leading-relaxed text-center">
            這個木盒……似乎要解開機關才能打開呢？
          </p>
          <ActionButton
            onClick={() => setStep("puzzle")}
            variant="gold"
            className="px-8 py-2 font-ui"
          >
            查看機關
          </ActionButton>
        </div>
      </div>
    );
  }

  /* ── puzzle ── */
  if (step === "puzzle") {
    return (
      <div className="w-full h-screen relative flex flex-col items-center justify-center gap-6 bg-stone-900">
        <ActionButton
          onClick={() => setStep("inspect")}
          variant="ghost"
          className="absolute top-4 left-4 text-stone-400 text-sm border border-stone-700 px-3 py-1 font-ui"
        >
          返回
        </ActionButton>

        <p className="text-stone-400 text-xs font-ui tracking-widest">滑動方塊，將圖案復原</p>

        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, width: 240, height: 240 }}
        >
          {tiles.map((tile, idx) => (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              className={`flex items-center justify-center rounded text-lg font-bold font-ui transition-all duration-150
                ${tile === 0
                  ? "bg-stone-800 cursor-default"
                  : "bg-amber-800 border-2 border-amber-600 text-amber-100 hover:bg-amber-700 active:scale-95 cursor-pointer"
                }`}
            >
              {tile !== 0 && tile}
            </button>
          ))}
        </div>

        <button
          onClick={() => setTiles(generatePuzzle())}
          className="text-stone-600 text-xs font-ui hover:text-stone-400 transition-colors"
        >
          重新打亂
        </button>
      </div>
    );
  }

  /* ── solved ── */
  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-center gap-5 bg-stone-900 px-6">
      <ActionButton
        href="/explore/center-wall"
        variant="ghost"
        className="absolute top-4 left-4 text-stone-400 text-sm border border-stone-700 px-3 py-1 font-ui"
      >
        返回
      </ActionButton>

      <p className="text-green-400 font-bold text-base font-ui">機關解開了！</p>

      <div className="w-64 h-44 bg-stone-700 border border-stone-500 rounded flex items-center justify-center text-stone-400 text-xs font-ui">
        [巫婆吃人的圖片]
      </div>

      <p className="text-stone-300 text-sm font-body text-center max-w-xs leading-relaxed">
        木盒裡藏著一張畫——畫中的女巫正在烹煮小孩。<br />
        <span className="text-red-400">這就是她的計畫……</span>
      </p>

      <ActionButton
        onClick={() => router.push("/explore")}
        variant="ghost"
        className="mt-2 px-8 py-2 font-ui text-stone-400 border border-stone-700"
      >
        返回場景
      </ActionButton>
    </div>
  );
}
