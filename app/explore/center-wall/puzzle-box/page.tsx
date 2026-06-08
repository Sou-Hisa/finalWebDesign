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
      <div className="w-full h-screen relative flex flex-col items-center justify-center gap-6 bg-black overflow-hidden px-6">
        <Img
          src="/images/explore_middle.png"
          alt="center_wall"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none opacity-35 blur-xs"
        />
        <ActionButton
          href="/explore/center-wall"
          variant="back"
          className="absolute top-4 left-4 z-20"
        >
          ← 返回
        </ActionButton>

        <div className="relative z-10 w-full max-w-2xl mx-8 rounded-xl p-10 bg-stone-950/92 border border-amber-900/50 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col items-center gap-6">
          <Img
            src="/images/explore_item_box.png"
            className="w-40 h-auto"
            alt="[箱子圖片]"
            width={160}
            height={120}
          />
          <p className="text-stone-200 text-sm font-body leading-relaxed text-center">
            這個木盒……似乎要解開機關才能打開呢？
          </p>
          <ActionButton
            onClick={() => setStep("puzzle")}
            variant="gold"
            className="w-full"
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
      <div className="w-full h-screen relative flex flex-col items-center justify-center gap-6 bg-black overflow-hidden">
        <Img
          src="/images/explore_middle.png"
          alt="center_wall"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none opacity-35 blur-xs"
        />
        <ActionButton
          onClick={() => setStep("inspect")}
          variant="back"
          className="absolute top-4 left-4 z-20"
        >
          ← 返回
        </ActionButton>

        <p className="relative z-10 text-stone-300 text-xs font-ui tracking-widest">滑動方塊，將圖案復原</p>

        <div
          className="relative z-10 grid gap-[2px]"
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
          className="relative z-10 text-stone-400 text-xs font-ui hover:text-stone-200 transition-colors"
        >
          重新打亂
        </button>
      </div>
    );
  }

  /* ── solved ── */
  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-center gap-5 bg-black overflow-hidden px-6">
      <Img
        src="/images/explore_middle.png"
        alt="center_wall"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none opacity-35 blur-xs"
      />
      <ActionButton
        href="/explore/center-wall"
        variant="white"
        className="absolute top-4 left-4 z-20 text-sm font-ui"
      >
        返回
      </ActionButton>

      <div className="relative z-10 w-full max-w-2xl mx-8 rounded-xl p-10 bg-stone-950/92 border border-amber-900/50 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col items-center gap-6">
        <p className="text-stone-200 font-bold text-base font-ui">機關解開了！</p>
        <img
          src="/images/explore_item_recipe.png"
          alt="木盒中的食譜"
          className="
            w-64
            h-44
            rounded-lg
            border
            border-white/20
            object-cover
          "
        />
        <p className="text-stone-200 text-sm font-body text-center leading-loose">
          木盒裡藏著一張畫——畫中是女巫的煮小孩食譜<br />
          <span className="text-red-400">這就是她的計畫……</span>
        </p>
        <ActionButton
          onClick={() => router.push("/explore")}
          variant="gold"
          className="w-full"
        >
          返回場景
        </ActionButton>
      </div>
    </div>
  );
}
