"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../../../store/store";
import ActionButton from "../../../../component/ActionButton";
import Img from "next/image";

type BoxStep = "inspect" | "puzzle" | "solved";

const SIZE = 3;

function generatePuzzle(): number[] {
  const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  let emptyIdx = 8;
  for (let i = 0; i < 50; i++) {
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
        <Img
          src="/images/explore_item_box.png"
          className="w-40 h-auto"
          alt="[箱子圖片]"
          width={160}
          height={120}
        />
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
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${SIZE}, 120px)`,
            width: 360,
            height: 360,
          }}
        >
          {tiles.map((tile, idx) => {
            if (tile === 0) {
              return (
                <button
                  key={idx}
                  onClick={() => handleTileClick(idx)}
                  className="
                    w-[120px]
                    h-[120px]
                    bg-stone-900
                    border
                    border-stone-700
                  "
                />
              );
            }

            const tileIndex = tile - 1;

      const x = tileIndex % SIZE;
      const y = Math.floor(tileIndex / SIZE);

      return (
        <button
          key={idx}
          onClick={() => handleTileClick(idx)}
          className="
            w-30
            h-30
            border
            border-amber-950
            bg-no-repeat
            cursor-pointer
            active:scale-95
            transition
          "
          style={{
            backgroundImage:
              "url('/images/explore_item_puzzle.png')",

            backgroundSize: "360px 360px",

            backgroundPosition:
              `-${x * 120}px -${y * 120}px`,
          }}
        />
      );
          })}
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

      <p className="text-gray-300 font-bold text-base font-ui">機關解開了！</p>

      <div className="w-64 h-44 bg-stone-700 border border-stone-500 rounded flex items-center justify-center text-stone-400 text-xs font-ui">
        [巫婆吃人的圖片]
      </div>

      <p className="text-stone-300 text-sm font-body text-center max-w-xs leading-loose">
        木盒裡藏著一張畫——畫中是女巫的煮小孩食譜<br />
        <span className=" text-red-400">這就是她的計畫……</span>
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
