"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";

// ── 符文定義 ──────────────────────────────────────────────
// 每個符文用「方向序列」描述，由滑鼠軌跡抽取後比對
// 方向：R=右 L=左 U=上 D=下
type Dir = "R" | "L" | "U" | "D";
interface Spell {
  id: string;
  label: string;          // 顯示給玩家的符號
  hint: string;           // 提示文字
  sequence: Dir[];        // 期望方向序列
}

const SPELLS: Spell[] = [
  { id: "circle",    label: "○",  hint: "畫一個圓形（順時針）",  sequence: ["R","D","L","U"] },
  { id: "cross",     label: "✕",  hint: "畫一條斜線（左上→右下）", sequence: ["R","D"] },
  { id: "zigzag",    label: "Z",  hint: "畫 Z 字形",            sequence: ["R","L","R"] },
  { id: "up",        label: "↑",  hint: "往上畫一條線",          sequence: ["U"] },
  { id: "spiral",    label: "~",  hint: "畫 S 波浪",             sequence: ["R","L","R","L"] },
];

const TOTAL_HP = 3;   // 巫婆血量（需畫對幾個符文才打敗）
const TIME_LIMIT = 30; // 倒數秒數

// ── 方向向量提取工具 ──────────────────────────────────────
function extractDirections(points: { x: number; y: number }[]): Dir[] {
  if (points.length < 2) return [];
  const dirs: Dir[] = [];
  const segLen = Math.max(3, Math.floor(points.length / 6));
  for (let i = 0; i < points.length - segLen; i += segLen) {
    const dx = points[i + segLen].x - points[i].x;
    const dy = points[i + segLen].y - points[i].y;
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) continue;
    if (Math.abs(dx) > Math.abs(dy)) {
      dirs.push(dx > 0 ? "R" : "L");
    } else {
      dirs.push(dy > 0 ? "D" : "U");
    }
  }
  // 去除連續重複
  return dirs.filter((d, i) => i === 0 || d !== dirs[i - 1]);
}

function matchSequence(drawn: Dir[], expected: Dir[]): boolean {
  if (drawn.length < expected.length) return false;
  // 允許子序列匹配（drawn 中找到 expected 的連續子序列）
  const s = expected.join("");
  const d = drawn.join("");
  return d.includes(s);
}

// ── 主元件 ────────────────────────────────────────────────
type Phase = "dialogue" | "intro" | "battle" | "casting";

export default function Battle() {
  const router = useRouter();
  const dialogues = useGameStore((s) => s.battleDialogues);

  const [phase, setPhase] = useState<Phase>("dialogue");
  const [dialogueIndex, setDialogueIndex] = useState(0);

  // 決戰狀態
  const [witchHp, setWitchHp] = useState(TOTAL_HP);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [currentSpellIndex, setCurrentSpellIndex] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [witchShake, setWitchShake] = useState(false);

  // Canvas 繪圖
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);

  // 倒計時
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const endBattle = useCallback((win: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    router.push(win ? "/ending/success" : "/ending/fail");
  }, [router]);

  useEffect(() => {
    if (phase !== "battle") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endBattle(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, endBattle]);

  // ── Canvas 事件 ──
  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (phase !== "battle") return;
    drawing.current = true;
    points.current = [getPos(e)];
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    ctx.beginPath();
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.moveTo(points.current[0].x, points.current[0].y);
  }

  function continueDraw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current || phase !== "battle") return;
    const pos = getPos(e);
    points.current.push(pos);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function endDraw() {
    if (!drawing.current || phase !== "battle") return;
    drawing.current = false;

    const spell = SPELLS[currentSpellIndex % SPELLS.length];
    const dirs = extractDirections(points.current);
    const matched = matchSequence(dirs, spell.sequence);

    if (matched) {
      setFeedback("correct");
      setWitchShake(true);
      setTimeout(() => setWitchShake(false), 500);
      const newHp = witchHp - 1;
      setWitchHp(newHp);
      if (newHp <= 0) {
        setTimeout(() => endBattle(true), 800);
      } else {
        setCurrentSpellIndex((i) => i + 1);
        setTimeout(() => setFeedback(null), 800);
      }
    } else {
      setFeedback("wrong");
      setTimeout(() => setFeedback(null), 800);
    }

    // 清除畫布
    setTimeout(() => {
      const ctx = canvasRef.current?.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    }, 400);
  }

  // ── 對話階段 ──
  const isLastDialogue = dialogueIndex === dialogues.length - 1;
  function handleDialogueNext() {
    if (isLastDialogue) {
      setPhase("intro");
    } else {
      setDialogueIndex((i) => i + 1);
    }
  }

  const currentSpell = SPELLS[currentSpellIndex % SPELLS.length];

  return (
    <div className="w-full h-screen flex flex-col bg-gray-950 overflow-hidden relative">

      {/* ── 對話階段 ── */}
      {phase === "dialogue" && (
        <>
          <div className="flex-1 flex items-center justify-center relative">
            {/* 火爐場景 */}
            <div className="absolute inset-0 flex items-end justify-center pb-16 gap-16 pointer-events-none">
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl">👧</span>
                <span className="text-amber-300 text-xs">葛麗特</span>
              </div>
              <div className="w-28 h-28 bg-orange-900 border-4 border-orange-500 rounded flex items-center justify-center">
                <span className="text-5xl">🔥</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl">🧙‍♀️</span>
                <span className="text-red-400 text-xs">女巫</span>
              </div>
            </div>
          </div>
          <DialogueBox
            character={dialogues[dialogueIndex].character}
            text={dialogues[dialogueIndex].text}
            onNext={handleDialogueNext}
            isLast={isLastDialogue}
            lastLabel="開始決戰！"
          />
        </>
      )}

      {/* ── 遊戲說明 popup ── */}
      {phase === "intro" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-sm mx-4 border-2 border-purple-500 bg-gray-900 p-6 flex flex-col gap-4 shadow-2xl">
            <h2 className="text-xl font-bold text-center text-purple-300">遊戲說明</h2>
            <ul className="text-sm text-gray-200 leading-relaxed list-disc list-inside space-y-1">
              <li>畫面會顯示一個符文形狀</li>
              <li>用滑鼠（或手指）在畫布上畫出對應形狀</li>
              <li>畫對了就能傷害巫婆</li>
              <li>打敗巫婆需要命中 {TOTAL_HP} 次</li>
              <li>限時 {TIME_LIMIT} 秒，時間到即失敗</li>
            </ul>
            <div className="flex gap-3 justify-center mt-2">
              <button
                onClick={() => router.push("/ending/fail")}
                className="border-2 border-gray-500 px-5 py-2 text-gray-400 hover:bg-gray-700 transition-colors text-sm"
              >
                撤離
              </button>
              <button
                onClick={() => setPhase("battle")}
                className="border-2 border-purple-500 px-6 py-2 font-bold text-purple-300 hover:bg-purple-700 hover:text-white transition-colors"
              >
                挑戰！
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 決戰場景 ── */}
      {phase === "battle" && (
        <>
          {/* HUD */}
          <div className="flex items-center justify-between px-6 py-2 bg-gray-900 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-sm font-bold">巫婆血量</span>
              <div className="flex gap-1">
                {Array.from({ length: TOTAL_HP }).map((_, i) => (
                  <span key={i} className={`text-xl ${i < witchHp ? "text-red-500" : "text-gray-700"}`}>
                    {i < witchHp ? "❤️" : "🖤"}
                  </span>
                ))}
              </div>
            </div>
            <div className={`text-lg font-bold tabular-nums ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-amber-300"}`}>
              ⏱ {timeLeft}s
            </div>
          </div>

          {/* 主場景 */}
          <div className="flex-1 flex relative overflow-hidden">
            {/* 巫婆 */}
            <div className={`absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-transform ${witchShake ? "animate-bounce" : ""}`}>
              <span className="text-7xl select-none">{witchHp > 0 ? "🧙‍♀️" : "💀"}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: TOTAL_HP }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < witchHp ? "bg-red-500" : "bg-gray-700"}`} />
                ))}
              </div>
            </div>

            {/* 符文提示 */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <p className="text-gray-400 text-xs">畫出這個符文：</p>
              <div className="text-6xl font-bold text-purple-300 select-none">{currentSpell.label}</div>
              <p className="text-purple-200 text-xs">{currentSpell.hint}</p>
            </div>

            {/* 回饋訊息 */}
            {feedback && (
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-3xl font-black pointer-events-none select-none ${feedback === "correct" ? "text-green-400" : "text-red-400"}`}>
                {feedback === "correct" ? "✨ 命中！" : "❌ 再試！"}
              </div>
            )}

            {/* Canvas 繪圖區 */}
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseMove={continueDraw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={continueDraw}
              onTouchEnd={endDraw}
            />

            {/* 葛麗特（右側） */}
            <div className="absolute right-8 bottom-8 flex flex-col items-center gap-2">
              <span className="text-5xl select-none">👧</span>
              <span className="text-pink-300 text-xs">葛麗特</span>
            </div>

            {/* 火爐 */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-orange-900 border-2 border-orange-600 rounded flex items-center justify-center">
              <span className="text-4xl">🔥</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
