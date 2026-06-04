"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-stone-700 text-gray-100 border border-stone-500 text-xs font-ui ${className}`}>
      {label}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  符文定義（多筆畫形狀：V / Z / N / L / 圓）
// ══════════════════════════════════════════════════════════
type SpellId = "V" | "Z" | "N" | "L" | "circle";

interface Spell {
  id:    SpellId;
  glyph: string;
  name:  string;
  hint:  string;
  color: string;
}

const SPELLS: Spell[] = [
  { id: "V",      glyph: "V",  name: "V 形斬",  hint: "從左上往下再往右上",  color: "#60a5fa" },
  { id: "circle", glyph: "◉",  name: "封印陣",  hint: "畫一個完整的圓",      color: "#c084fc" },
  { id: "Z",      glyph: "Z",  name: "Z 形咒",  hint: "從左往右、斜下左、再往右", color: "#34d399" },
  { id: "N",      glyph: "N",  name: "N 形紋",  hint: "往上、斜下右、再往上", color: "#fbbf24" },
  { id: "L",      glyph: "L",  name: "L 形術",  hint: "往下再往右",           color: "#f472b6" },
];

const TOTAL_HP   = 3;
const TIME_LIMIT = 45;

type Point = { x: number; y: number };

// ══════════════════════════════════════════════════════════
//  多段形狀偵測（分段分析向量方向）
// ══════════════════════════════════════════════════════════
function detectSpell(pts: Point[], cw: number, ch: number): SpellId | null {
  if (pts.length < 5) return null;

  // 計算總路徑長
  let pathLen = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
    pathLen += Math.sqrt(dx * dx + dy * dy);
  }

  const diagLen = Math.sqrt(cw * cw + ch * ch);
  const minPath = diagLen * 0.12;    // 最小有效路徑長
  if (pathLen < minPath) return null;

  const first = pts[0], last = pts[pts.length - 1];
  const endDist = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2);

  // ── 圓形：起終點很近，路徑夠長 ──────────────────────
  if (endDist < diagLen * 0.09 && pathLen > diagLen * 0.20) return "circle";

  // ── 分段向量分析 ─────────────────────────────────────
  const minSeg = cw * 0.035; // 每段最小有意義位移（約 canvas 寬的 3.5%）

  function segVec(iStart: number, iEnd: number) {
    const s = pts[Math.min(iStart, pts.length - 1)];
    const e = pts[Math.min(iEnd,   pts.length - 1)];
    return { dx: e.x - s.x, dy: e.y - s.y };
  }

  const half  = Math.floor(pts.length / 2);
  const third = Math.floor(pts.length / 3);

  const h1 = segVec(0, half);
  const h2 = segVec(half, pts.length - 1);
  const t1 = segVec(0, third);
  const t2 = segVec(third, third * 2);
  const t3 = segVec(third * 2, pts.length - 1);

  // ── V：前半往下，後半往上 ──────────────────────────
  if (h1.dy > minSeg && h2.dy < -minSeg) return "V";

  // ── Z：右 → 斜左下 → 右 ───────────────────────────
  if (
    t1.dx >  minSeg &&                   // 往右
    t2.dx < -minSeg && t2.dy > minSeg && // 斜左下
    t3.dx >  minSeg                      // 往右
  ) return "Z";

  // ── N：上 → 斜右下 → 上 ───────────────────────────
  if (
    t1.dy < -minSeg &&                   // 往上
    t2.dy >  minSeg && t2.dx > minSeg && // 斜右下
    t3.dy < -minSeg                      // 往上
  ) return "N";

  // ── L：前半往下，後半往右 ─────────────────────────
  if (
    h1.dy > minSeg * 1.5 &&
    h2.dx > minSeg &&
    Math.abs(h2.dy) < Math.abs(h2.dx) * 1.5 // 後半以水平為主
  ) return "L";

  return null;
}

// ── 粒子爆破 ─────────────────────────────────────────────
function spawnParticles(canvas: HTMLCanvasElement, x: number, y: number, color: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const particles = Array.from({ length: 28 }, () => ({
    x, y, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
    life: 1.0, color, size: Math.random() * 6 + 2,
  }));
  let frame = 0;
  function animate() {
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy; p.life -= 0.04;
      ctx!.save();
      ctx!.globalAlpha = Math.max(0, p.life);
      ctx!.fillStyle = p.color; ctx!.shadowColor = p.color; ctx!.shadowBlur = 8;
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, Math.max(0, p.size * p.life), 0, Math.PI * 2);
      ctx!.fill(); ctx!.restore();
    });
    if (frame++ < 35 && particles.some((p) => p.life > 0)) requestAnimationFrame(animate);
    else ctx!.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

type Phase = "dialogue" | "intro" | "battle";

export default function Battle() {
  const router    = useRouter();
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

  useEffect(() => {
    if (phase !== "battle") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { endBattle(false); return 0; } return t - 1; });
    }, 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [phase, endBattle]);

  function getPos(e: React.MouseEvent | React.TouchEvent): Point {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
    if ("touches" in e)
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (phase !== "battle") return;
    const pos = getPos(e);
    drawing.current = true; points.current = [pos]; lastPt.current = pos;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    ctx.beginPath();
    ctx.strokeStyle = currentSpell.color; ctx.lineWidth = 5;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.shadowColor = currentSpell.color; ctx.shadowBlur = 14;
    ctx.moveTo(pos.x, pos.y);
  }

  function continueDraw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current || phase !== "battle") return;
    const pos = getPos(e);
    points.current.push(pos); lastPt.current = pos;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(pos.x, pos.y); ctx.stroke();
  }

  function endDraw() {
    if (!drawing.current || phase !== "battle") return;
    drawing.current = false;
    const canvas = canvasRef.current!;
    const matched = detectSpell(points.current, canvas.width, canvas.height);
    const spell   = SPELLS[spellIdx % SPELLS.length];
    points.current = [];

    if (matched === spell.id) {
      setFeedback("correct");
      if (lastPt.current) spawnParticles(canvas, lastPt.current.x, lastPt.current.y, spell.color);
      const newHp = witchHp - 1;
      setWitchHp(newHp);
      if (newHp <= 0) setTimeout(() => endBattle(true), 900);
      else { setSpellIdx((i) => i + 1); setTimeout(() => setFeedback(null), 700); }
    } else {
      setFeedback("wrong"); setScreenFlash(true);
      setTimeout(() => {
        setFeedback(null); setScreenFlash(false);
        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      }, 600);
    }
  }

  const isLastDialogue = dialogueIndex === dialogues.length - 1;
  const currentSpell   = SPELLS[spellIdx % SPELLS.length];

  return (
    <div className="w-full h-screen flex flex-col bg-stone-950 overflow-hidden relative">

      {/* 螢幕閃紅 */}
      {screenFlash && (
        <div className="absolute inset-0 z-50 pointer-events-none flash-red"
          style={{ background: "rgba(192,57,43,0.32)" }} />
      )}

      {/* ════ 對話階段 ════ */}
      {phase === "dialogue" && (
        <>
          <div className="flex-1 relative">
            <Placeholder label="[決戰場景 背景圖]" className="absolute inset-0" />
            {/* 角色：3:4 比例，貼底橫排 */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-10 items-end pb-2">
              <Placeholder label="[葛麗特]" className="w-32 h-40" />
              <Placeholder label="[火爐]"   className="w-28 h-28" />
              <Placeholder label="[女巫]"   className="w-32 h-40" />
            </div>
          </div>
          <DialogueBox
            character={dialogues[dialogueIndex].character}
            text={dialogues[dialogueIndex].text}
            onNext={() => isLastDialogue ? setPhase("intro") : setDialogueIndex((i) => i + 1)}
            isLast={isLastDialogue} lastLabel="開始決戰！"
          />
        </>
      )}

      {/* ════ 遊戲說明 popup ════ */}
      {phase === "intro" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-md mx-4 border-2 p-6 flex flex-col gap-4"
            style={{ borderColor: "#8b5cf6", background: "#12071e" }}>
            <h2 className="text-xl font-title text-center" style={{ color: "#c084fc" }}>決戰說明</h2>
            <p className="text-sm font-body text-stone-300">
              畫面會顯示一個魔法符文形狀，用滑鼠（或手指）在畫面上<strong>連續畫出</strong>對應形狀：
            </p>
            {/* 符文示意表 */}
            <div className="grid grid-cols-5 gap-2 text-center">
              {SPELLS.map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-1 border border-stone-700 rounded p-2">
                  <span className="text-2xl font-bold" style={{ color: s.color }}>{s.glyph}</span>
                  <span className="text-[10px] font-ui text-stone-400 leading-tight">{s.hint}</span>
                </div>
              ))}
            </div>
            <p className="text-xs font-ui text-stone-500 text-center">
              命中 {TOTAL_HP} 次打敗巫婆 ／ 限時 {TIME_LIMIT} 秒
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push("/ending/fail")}
                className="border-2 border-stone-600 px-5 py-2 text-stone-400 hover:bg-stone-800 transition-colors text-sm font-ui">
                撤離
              </button>
              <button onClick={() => setPhase("battle")}
                className="border-2 px-6 py-2 font-ui font-bold"
                style={{ borderColor: "#8b5cf6", color: "#c084fc", background: "rgba(139,92,246,0.15)" }}>
                挑戰！
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ 決戰場景 ════ */}
      {phase === "battle" && (
        <>
          {/* HUD */}
          <div className="flex items-center justify-between px-5 py-2 border-b"
            style={{ background: "rgba(0,0,0,0.7)", borderColor: "#ffffff18" }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-ui text-stone-400">巫婆血量</span>
              <div className="flex gap-1">
                {Array.from({ length: TOTAL_HP }).map((_, i) => (
                  <span key={i} className="text-lg">{i < witchHp ? "❤️" : "🖤"}</span>
                ))}
              </div>
            </div>
            <span className="text-xs font-ui tracking-widest" style={{ color: currentSpell.color }}>
              {currentSpell.name}
            </span>
            <div className={`text-lg font-ui font-bold tabular-nums ${timeLeft <= 10 ? "text-red-400 animate-pulse" : ""}`}
              style={{ color: timeLeft <= 10 ? undefined : "#f5a623" }}>
              ⏱ {timeLeft}s
            </div>
          </div>

          {/* 主場景 */}
          <div className="flex-1 relative overflow-hidden">

            {/* 背景佔位 */}
            <Placeholder label="[決戰背景圖]" className="absolute inset-0" />

            {/* ── 符文展示框（中央偏上） ── */}
            <AnimatePresence mode="wait">
              <motion.div key={spellIdx}
                initial={{ scale: 0.6, opacity: 0, y: -8 }}
                animate={{ scale: 1,   opacity: 1, y: 0  }}
                exit={{   scale: 1.2,  opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 pointer-events-none"
              >
                <div className="flex flex-col items-center gap-1 px-10 py-4 border-2"
                  style={{
                    borderColor: currentSpell.color,
                    background: `${currentSpell.color}18`,
                    boxShadow: `0 0 28px ${currentSpell.color}44, inset 0 0 16px ${currentSpell.color}11`,
                  }}>
                  <span className="font-bold select-none leading-none" style={{
                    fontSize: "5rem",
                    color: currentSpell.color,
                    textShadow: `0 0 20px ${currentSpell.color}, 0 0 40px ${currentSpell.color}88`,
                  }}>
                    {currentSpell.glyph}
                  </span>
                  <span className="font-title text-base tracking-widest" style={{ color: currentSpell.color }}>
                    {currentSpell.name}
                  </span>
                  <span className="font-ui text-xs text-stone-400">{currentSpell.hint}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* ── 命中 / 失敗 浮字 ── */}
            <AnimatePresence>
              {feedback && (
                <motion.div key={feedback}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  exit={{ scale: 1.3, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none select-none"
                >
                  <p className="text-5xl font-black" style={{
                    color: feedback === "correct" ? "#4ade80" : "#f87171",
                    textShadow: feedback === "correct" ? "0 0 24px #4ade80" : "0 0 24px #f87171",
                  }}>
                    {feedback === "correct" ? "✦ 命中！" : "✕ 再試！"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Canvas（覆蓋全場景） ── */}
            <canvas ref={canvasRef} width={800} height={600}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
              onMouseDown={startDraw} onMouseMove={continueDraw}
              onMouseUp={endDraw} onMouseLeave={endDraw}
              onTouchStart={startDraw} onTouchMove={continueDraw} onTouchEnd={endDraw}
            />

            {/* ── 角色（底部橫排，3:4 比例） ── */}
            <div className="absolute bottom-0 w-full flex items-end justify-between px-6 pb-2 pointer-events-none">
              {/* 女巫（左） */}
              <div className="flex flex-col items-center gap-1">
                <Placeholder
                  label={witchHp > 0 ? "[女巫 立繪]" : "[女巫 倒下]"}
                  className="w-32 h-40"
                />
                <div className="flex gap-1">
                  {Array.from({ length: TOTAL_HP }).map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full"
                      style={{ background: i < witchHp ? "#ef4444" : "#374151",
                                boxShadow: i < witchHp ? "0 0 5px #ef4444" : "none" }} />
                  ))}
                </div>
              </div>

              {/* 火爐（中） */}
              <Placeholder label="[火爐]" className="w-28 h-28" />

              {/* 葛麗特（右） */}
              <Placeholder label="[葛麗特 立繪]" className="w-28 h-36" />
            </div>

          </div>
        </>
      )}
    </div>
  );
}
