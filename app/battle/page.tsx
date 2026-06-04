"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";

// ══════════════════════════════════════════════════════════
//  符文定義（簡化版：方向滑動 + 畫圓）
// ══════════════════════════════════════════════════════════
type SpellId = "up" | "right" | "down" | "left" | "circle";

interface Spell {
  id:    SpellId;
  label: string;
  hint:  string;
}

const SPELLS: Spell[] = [
  { id: "up",     label: "↑", hint: "往上滑" },
  { id: "circle", label: "○", hint: "畫一個圓" },
  { id: "right",  label: "→", hint: "往右滑" },
  { id: "down",   label: "↓", hint: "往下滑" },
  { id: "circle", label: "○", hint: "畫一個圓" },
];

const TOTAL_HP   = 3;
const TIME_LIMIT = 45;   // 延長至 45 秒
const MIN_DIST   = 50;   // 最短有效滑動距離（px，相對 canvas 尺寸）

type Point = { x: number; y: number };

// ── 新版辨識：角度 + 圓形 ──────────────────────────────────
function detectSpell(pts: Point[], canvasW: number, canvasH: number): SpellId | null {
  if (pts.length < 3) return null;

  const first = pts[0];
  const last  = pts[pts.length - 1];
  const netX  = last.x - first.x;
  const netY  = last.y - first.y;
  const dist  = Math.sqrt(netX * netX + netY * netY);

  // 計算總路徑長度
  let pathLen = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    pathLen += Math.sqrt(dx * dx + dy * dy);
  }

  // 縮放基準（canvas 對角線的 15% 作為最小距離門檻）
  const scale = Math.sqrt(canvasW * canvasW + canvasH * canvasH);
  const minD  = scale * 0.08;   // ~8% 對角線

  // ── 圓形判斷：起終點距離很近，但路徑很長 ──
  if (dist < minD * 1.2 && pathLen > minD * 2.0) return "circle";

  // ── 方向滑動：起終點距離夠長 ──
  if (dist < minD) return null;

  const angle = Math.atan2(netY, netX) * (180 / Math.PI);
  // 允許 ±55° 的容忍範圍（比之前寬很多）
  if (angle > -145 && angle < -35)  return "up";
  if (angle > -35  && angle < 55)   return "right";
  if (angle > 35   && angle < 145)  return "down";
  return "left";
}

// Canvas 粒子爆破
function spawnParticles(canvas: HTMLCanvasElement, x: number, y: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const particles = Array.from({ length: 24 }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 0.5) * 8,
    life: 1.0,
    color: ["#f5a623","#8b5cf6","#e91e8c","#ffffff"][Math.floor(Math.random() * 4)],
    size: Math.random() * 5 + 2,
  }));
  let frame = 0;
  function animate() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.life -= 0.045;
      ctx!.save();
      ctx!.globalAlpha = Math.max(0, p.life);
      ctx!.fillStyle = p.color;
      ctx!.shadowColor = p.color;
      ctx!.shadowBlur = 6;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();
    });
    if (frame++ < 30 && particles.some((p) => p.life > 0)) requestAnimationFrame(animate);
    else ctx!.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

type Phase = "dialogue" | "intro" | "battle";

export default function Battle() {
  const router   = useRouter();
  const dialogues = useGameStore((s) => s.battleDialogues);

  const [phase,         setPhase]         = useState<Phase>("dialogue");
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [witchHp,       setWitchHp]       = useState(TOTAL_HP);
  const [timeLeft,      setTimeLeft]      = useState(TIME_LIMIT);
  const [spellIdx,      setSpellIdx]      = useState(0);
  const [feedback,      setFeedback]      = useState<"correct" | "wrong" | null>(null);
  const [screenFlash,   setScreenFlash]   = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);
  const points    = useRef<Point[]>([]);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPt    = useRef<Point | null>(null);

  const endBattle = useCallback((win: boolean) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    router.push(win ? "/ending/success" : "/ending/fail");
  }, [router]);

  // 計時器：只在 battle 階段啟動，離開時清除
  useEffect(() => {
    if (phase !== "battle") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { endBattle(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [phase, endBattle]);

  // ── Canvas 座標換算 ──
  function getPos(e: React.MouseEvent | React.TouchEvent): Point {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX,
               y: (e.touches[0].clientY - rect.top)  * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
             y: ((e as React.MouseEvent).clientY - rect.top)  * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (phase !== "battle") return;
    const pos = getPos(e);
    drawing.current  = true;
    points.current   = [pos];
    lastPt.current   = pos;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    ctx.beginPath();
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth   = 5;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.shadowColor = "#8b5cf6";
    ctx.shadowBlur  = 12;
    ctx.moveTo(pos.x, pos.y);
  }

  function continueDraw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current || phase !== "battle") return;
    const pos = getPos(e);
    points.current.push(pos);
    lastPt.current = pos;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function endDraw() {
    if (!drawing.current || phase !== "battle") return;
    drawing.current = false;

    const canvas  = canvasRef.current!;
    const matched = detectSpell(points.current, canvas.width, canvas.height);
    const spell   = SPELLS[spellIdx % SPELLS.length];

    // 清空 points
    points.current = [];

    if (matched === spell.id) {
      setFeedback("correct");
      if (lastPt.current) spawnParticles(canvas, lastPt.current.x, lastPt.current.y);
      const newHp = witchHp - 1;
      setWitchHp(newHp);
      if (newHp <= 0) {
        setTimeout(() => endBattle(true), 900);
      } else {
        setSpellIdx((i) => i + 1);
        setTimeout(() => setFeedback(null), 700);
      }
    } else {
      setFeedback("wrong");
      setScreenFlash(true);
      setTimeout(() => {
        setFeedback(null);
        setScreenFlash(false);
        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      }, 600);
    }
  }

  const isLastDialogue = dialogueIndex === dialogues.length - 1;
  const currentSpell   = SPELLS[spellIdx % SPELLS.length];

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden relative"
      style={{ background: "radial-gradient(ellipse at 50% 110%, #7c1d06 0%, #3b0a02 40%, #0d0705 100%)" }}>

      {/* 螢幕閃紅 */}
      {screenFlash && (
        <div className="absolute inset-0 z-50 pointer-events-none flash-red"
          style={{ background: "rgba(192,57,43,0.35)" }} />
      )}

      {/* 底部火光暈 */}
      <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 100%, #f97316aa 0%, transparent 70%)" }} />

      {/* ── 對話階段 ── */}
      {phase === "dialogue" && (
        <>
          <div className="flex-1 flex items-end justify-center gap-20 pb-8 relative">
            <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="flex flex-col items-center gap-2">
              <span className="text-6xl drop-shadow-lg">👧</span>
              <span className="text-xs font-ui" style={{ color: "#e91e8c" }}>葛麗特</span>
            </motion.div>
            <div className="w-24 h-24 rounded border-4 border-orange-600 flex items-center justify-center"
              style={{ background: "radial-gradient(circle, #ea580c, #7c2d12)" }}>
              <span className="text-5xl">🔥</span>
            </div>
            <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="flex flex-col items-center gap-2">
              <span className="text-6xl drop-shadow-lg">🧙‍♀️</span>
              <span className="text-xs font-ui text-purple-400">女巫</span>
            </motion.div>
          </div>
          <DialogueBox character={dialogues[dialogueIndex].character}
            text={dialogues[dialogueIndex].text}
            onNext={() => isLastDialogue ? setPhase("intro") : setDialogueIndex((i) => i + 1)}
            isLast={isLastDialogue} lastLabel="開始決戰！" />
        </>
      )}

      {/* ── 遊戲說明 popup ── */}
      {phase === "intro" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-full max-w-sm mx-4 border-2 p-6 flex flex-col gap-4 shadow-2xl border-glow-purple"
            style={{ borderColor: "#8b5cf6", background: "linear-gradient(160deg, #1a0c20ee, #0d0705ee)" }}>
            <h2 className="text-xl font-title text-center text-glow-purple" style={{ color: "#c084fc" }}>
              決戰說明
            </h2>
            <ul className="text-sm font-body leading-relaxed list-disc list-inside space-y-2" style={{ color: "#e8d5b0" }}>
              <li>畫面會顯示一個符文</li>
              <li>用滑鼠（或手指）在畫面上畫出對應動作</li>
              <li><strong>↑↓←→</strong> 代表往該方向滑動</li>
              <li><strong>○</strong> 代表畫一個圓圈（起點和終點接近）</li>
              <li>命中 <strong>{TOTAL_HP}</strong> 次即可打敗巫婆</li>
              <li>限時 <strong>{TIME_LIMIT}</strong> 秒</li>
            </ul>
            <div className="flex gap-3 justify-center mt-2">
              <button onClick={() => router.push("/ending/fail")}
                className="border-2 border-stone-600 px-5 py-2 text-stone-400 hover:bg-stone-800 transition-colors text-sm font-ui">
                撤離
              </button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setPhase("battle")}
                className="border-2 px-6 py-2 font-ui font-bold transition-all hover:brightness-125 border-glow-purple"
                style={{ borderColor: "#8b5cf6", color: "#c084fc", background: "rgba(139,92,246,0.15)" }}>
                挑戰！
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── 決戰場景 ── */}
      {phase === "battle" && (
        <>
          {/* HUD */}
          <div className="flex items-center justify-between px-6 py-2 border-b"
            style={{ background: "rgba(0,0,0,0.5)", borderColor: "#f5a62333" }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-ui" style={{ color: "#f5a623" }}>巫婆血量</span>
              <div className="flex gap-1">
                {Array.from({ length: TOTAL_HP }).map((_, i) => (
                  <span key={i} className="text-xl">{i < witchHp ? "❤️" : "🖤"}</span>
                ))}
              </div>
            </div>
            <div className={`text-lg font-ui font-bold tabular-nums ${timeLeft <= 10 ? "text-red-400 animate-pulse" : ""}`}
              style={{ color: timeLeft <= 10 ? undefined : "#f5a623" }}>
              ⏱ {timeLeft}s
            </div>
          </div>

          <div className="flex-1 relative overflow-hidden">
            {/* 巫婆 */}
            <motion.div
              animate={feedback === "correct" ? { x: [0, -20, 12, -8, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              <span className="select-none" style={{
                fontSize: "5rem",
                filter: witchHp === 0
                  ? "grayscale(1) opacity(0.4)"
                  : "drop-shadow(0 0 12px #8b5cf6)",
              }}>
                {witchHp > 0 ? "🧙‍♀️" : "💀"}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: TOTAL_HP }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-full transition-all"
                    style={{ background: i < witchHp ? "#ef4444" : "#374151" }} />
                ))}
              </div>
            </motion.div>

            {/* 符文提示 */}
            <AnimatePresence mode="wait">
              <motion.div key={spellIdx}
                initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.4, opacity: 0 }} transition={{ duration: 0.25 }}
                className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                <p className="text-xs font-ui text-stone-500">畫出這個符文：</p>
                <div className="text-8xl font-bold select-none text-glow-purple" style={{ color: "#c084fc" }}>
                  {currentSpell.label}
                </div>
                <p className="text-sm font-ui text-purple-300">{currentSpell.hint}</p>
              </motion.div>
            </AnimatePresence>

            {/* 命中/失敗浮字 */}
            <AnimatePresence>
              {feedback && (
                <motion.div key={feedback}
                  initial={{ y: 20, opacity: 0, scale: 0.8 }}
                  animate={{ y: -10, opacity: 1, scale: 1.1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-4xl font-black pointer-events-none select-none"
                  style={{
                    color: feedback === "correct" ? "#4ade80" : "#f87171",
                    textShadow: feedback === "correct" ? "0 0 16px #4ade80" : "0 0 16px #f87171",
                  }}>
                  {feedback === "correct" ? "✨ 命中！" : "❌ 再試！"}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Canvas 繪圖區 */}
            <canvas ref={canvasRef} width={800} height={500}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
              onMouseDown={startDraw} onMouseMove={continueDraw}
              onMouseUp={endDraw} onMouseLeave={endDraw}
              onTouchStart={startDraw} onTouchMove={continueDraw} onTouchEnd={endDraw} />

            {/* 葛麗特 */}
            <div className="absolute right-8 bottom-10 flex flex-col items-center gap-2">
              <span className="text-5xl select-none" style={{ filter: "drop-shadow(0 0 8px #e91e8c)" }}>👧</span>
              <span className="text-xs font-ui" style={{ color: "#e91e8c" }}>葛麗特</span>
            </div>

            {/* 火爐 */}
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded border-2 border-orange-600 flex items-center justify-center"
              style={{ background: "radial-gradient(circle, #ea580c, #7c2d12)", boxShadow: "0 0 20px #f9731666" }}>
              <span className="text-4xl">🔥</span>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
