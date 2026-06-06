"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";
import ActionButton from "../../component/ActionButton";

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
type SpellId = "V" | "Z" | "N" | "L" | "circle" | "mountain" | "seven";

interface Spell {
  id:    SpellId;
  glyph: string;
  name:  string;
  hint:  string;
  color: string;
}

const SPELLS: Spell[] = [
  { id: "V",        glyph: "V",  name: "V 形斬",  hint: "往下再往右上",              color: "#60a5fa" },
  { id: "circle",   glyph: "◉",  name: "封印陣",  hint: "畫一個完整的圓",            color: "#c084fc" },
  { id: "Z",        glyph: "Z",  name: "Z 形咒",  hint: "往右、斜左下、再往右",      color: "#34d399" },
  { id: "N",        glyph: "N",  name: "N 形紋",  hint: "往上、斜右下、再往上",      color: "#fbbf24" },
  { id: "L",        glyph: "L",  name: "L 形術",  hint: "往下再往右",                color: "#f472b6" },
  { id: "mountain", glyph: "∧",  name: "山形紋",  hint: "往右上再往右下",            color: "#fb923c" },
  { id: "seven",    glyph: "7",  name: "七形術",  hint: "往右再斜左下",              color: "#e879f9" },
];

function shuffleSpells(): Spell[] {
  const arr = [...SPELLS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const TOTAL_HP   = 5;
const TIME_LIMIT = 55;

type Point = { x: number; y: number };

// ══════════════════════════════════════════════════════════
//  多段形狀偵測（分段分析向量方向）
// ══════════════════════════════════════════════════════════
function detectSpell(pts: Point[], cw: number, ch: number): SpellId | null {
  if (pts.length < 8) return null;

  // ── 1. 累積弧長（arc-length parameterization） ─────────
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
    cum.push(cum[i-1] + Math.sqrt(dx*dx + dy*dy));
  }
  const totalLen = cum[cum.length - 1];
  const diagLen  = Math.sqrt(cw * cw + ch * ch);
  if (totalLen < diagLen * 0.07) return null;

  const n = pts.length;

  // ── 2. 5-point 滑動平均，降低噪點對極值的影響 ─────────
  const W = 4;
  const sx: number[] = [], sy: number[] = [];
  for (let i = 0; i < n; i++) {
    let sumX = 0, sumY = 0, cnt = 0;
    for (let j = Math.max(0, i-W); j <= Math.min(n-1, i+W); j++) {
      sumX += pts[j].x; sumY += pts[j].y; cnt++;
    }
    sx.push(sumX / cnt); sy.push(sumY / cnt);
  }

  // ── 3. 找極值點索引（在平滑後的值上找） ──────────────
  let maxYIdx = 0, minYIdx = 0, maxXIdx = 0, minXIdx = 0;
  for (let i = 1; i < n; i++) {
    if (sy[i] > sy[maxYIdx]) maxYIdx = i;
    if (sy[i] < sy[minYIdx]) minYIdx = i;
    if (sx[i] > sx[maxXIdx]) maxXIdx = i;
    if (sx[i] < sx[minXIdx]) minXIdx = i;
  }

  // 用弧長比例（0~1）表示極值點位置，不受繪製速度影響
  const bottomT = cum[maxYIdx] / totalLen;
  const topT    = cum[minYIdx] / totalLen;
  const rightT  = cum[maxXIdx] / totalLen;

  const totalH = sy[maxYIdx] - sy[minYIdx];
  const totalW = sx[maxXIdx] - sx[minXIdx];
  const minSpan = diagLen * 0.07;

  // ── 4. 按弧長插值，取路徑上任意比例位置的點 ──────────
  function atT(t: number): Point {
    const target = t * totalLen;
    let lo = 0;
    while (lo < n - 2 && cum[lo + 1] < target) lo++;
    const span = cum[lo+1] - cum[lo];
    const frac = span > 0 ? (target - cum[lo]) / span : 0;
    return {
      x: pts[lo].x + (pts[lo+1].x - pts[lo].x) * frac,
      y: pts[lo].y + (pts[lo+1].y - pts[lo].y) * frac,
    };
  }

  const first = pts[0], last = pts[n-1];
  const endDist = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2);

  // ── 圓形：起終點很近，路徑夠長 ──────────────────────
  if (endDist < diagLen * 0.15 && totalLen > diagLen * 0.17) return "circle";

  // ── V：最低點在路徑中段（20%~80%），兩端都明顯高於最低點 ──
  if (
    totalH > minSpan &&
    bottomT > 0.2 && bottomT < 0.8 &&
    sy[maxYIdx] - sy[0]   > totalH * 0.3 &&
    sy[maxYIdx] - sy[n-1] > totalH * 0.3
  ) return "V";

  // ── 山形 ∧：最高點在路徑中段，兩端都明顯低於最高點 ──
  if (
    totalH > minSpan &&
    topT > 0.2 && topT < 0.8 &&
    sy[0]   - sy[minYIdx] > totalH * 0.3 &&
    sy[n-1] - sy[minYIdx] > totalH * 0.3
  ) return "mountain";

  // ── 七形 7：最右點在路徑前半，之後向左且向下 ─────────
  if (
    totalW > minSpan &&
    rightT > 0.1 && rightT < 0.62 &&
    sx[maxXIdx] - sx[0]   > totalW * 0.25 &&  // 有向右筆畫
    sx[maxXIdx] - sx[n-1] > totalW * 0.15 &&  // 終點在最右點左邊
    sy[n-1]     - sy[maxXIdx] > minSpan * 0.4 // 終點在最右點下方
  ) return "seven";

  // ── L：最低點在路徑後段（35%後），最低點之後繼續往右 ─
  if (
    totalH > minSpan &&
    bottomT > 0.35 && bottomT < 0.88 &&
    sx[n-1] - sx[maxYIdx] > totalW * 0.2 &&
    sy[n-1] - sy[0] > totalH * 0.3
  ) return "L";

  // ── Z / N：弧長三等分後分析每段方向 ─────────────────
  const p0 = first, p1 = atT(0.33), p2 = atT(0.67), p3 = last;
  const s1 = { dx: p1.x - p0.x, dy: p1.y - p0.y };
  const s2 = { dx: p2.x - p1.x, dy: p2.y - p1.y };
  const s3 = { dx: p3.x - p2.x, dy: p3.y - p2.y };
  const m = diagLen * 0.04;

  if (s1.dx > m && s2.dx < -m && s2.dy > m && s3.dx > m) return "Z";
  if (s1.dy < -m && s2.dy > m && s2.dx > m && s3.dy < -m) return "N";

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
  const [spellQueue,    setSpellQueue]    = useState<Spell[]>(() => shuffleSpells());
  const [feedback,      setFeedback]      = useState<"correct" | "wrong" | null>(null);
  const [screenFlash,   setScreenFlash]   = useState(false);
  const [canDraw,       setCanDraw]       = useState(false);

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

  // 每當符文切換，短暫鎖定畫布（就緒信號）
  useEffect(() => {
    if (phase !== "battle") return;
    const t = setTimeout(() => setCanDraw(true), 300);
    return () => clearTimeout(t);
  }, [spellIdx, phase]);

  function getPos(e: React.MouseEvent | React.TouchEvent): Point {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
    if ("touches" in e)
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (phase !== "battle" || !canDraw) return;
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
    const spell   = spellQueue[spellIdx % spellQueue.length];
    // debug info removed in production UI
    points.current = [];

    if (matched === spell.id) {
      setFeedback("correct");
      if (lastPt.current) spawnParticles(canvas, lastPt.current.x, lastPt.current.y, spell.color);
      const newHp = witchHp - 1;
      setWitchHp(newHp);
      if (newHp <= 0) setTimeout(() => endBattle(true), 900);
      else {
        setCanDraw(false);
        setSpellIdx((i) => {
          const next = i + 1;
          if (next % spellQueue.length === 0) setSpellQueue(shuffleSpells());
          return next;
        });
        setTimeout(() => setFeedback(null), 700);
      }
    } else {
      setFeedback("wrong"); setScreenFlash(true);
      setTimeLeft((t) => Math.max(0, t - 5));
      setTimeout(() => {
        setFeedback(null); setScreenFlash(false);
        canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      }, 600);
    }
  }

  const isLastDialogue = dialogueIndex === dialogues.length - 1;
  const currentSpell   = spellQueue[spellIdx % spellQueue.length];

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
            {/*<Placeholder label="[決戰場景 背景圖]" className="absolute inset-0" />*/}
            <img
              src="/images/bg_battle.png"
              alt="決戰場景背景"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* 角色：3:4 比例，貼底橫排 */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-10 items-end pb-2">
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
          <div className="w-full max-w-6xl mx-4 border-2 rounded-lg p-6 flex flex-col gap-4"
            style={{ borderColor: "#8b5cf6", background: "#12071e" }}>
            <h2 className="text-xl font-title text-center" style={{ color: "#c084fc" }}>決戰說明</h2>
            <p className="text-sm font-body text-stone-300 text-center">
              畫面會顯示一個魔法符文形狀，用滑鼠在畫面上連續畫出對應形狀
            </p>
            {/* 符文示意表 */}
            <div className="grid grid-cols-7 gap-2 text-center">
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
              <ActionButton
                href="/ending/fail"
                variant="ghost"
                className="px-5 py-2 text-sm"
                style={{ borderColor: "#6b7280", color: "#d1d5db" }}
              >
                撤離
              </ActionButton>
              <ActionButton
                onClick={() => { setCanDraw(false); setPhase("battle"); }}
                variant="ghost"
                className="px-6 py-2 border-[#8b5cf6]! hover:bg-[#8b5cf6]! hover:text-white!"
              >
                挑戰！
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* ════ 決戰場景 ════ */}
      {phase === "battle" && (
        <>
          {/* HUD */}
          <div className="flex items-center px-6 py-6 relative">
            <div className="flex items-center gap-3">
              <span className="text-xs font-ui text-stone-300">巫婆血量</span>
              <div className="flex gap-2">
                {Array.from({ length: TOTAL_HP }).map((_, i) => (
                  <div key={i} className="w-4 h-4"
                    style={{
                      borderRadius: 9999,
                      background: i < witchHp ? "#ef4444" : "transparent",
                      border: i < witchHp ? "1px solid #ef4444" : "1px solid #374151",
                      boxShadow: i < witchHp ? "0 0 6px rgba(239,68,68,0.45)" : "none",
                    }} />
                ))}
              </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2">
              <div className={`font-ui font-bold tabular-nums text-base ${timeLeft <= 10 ? "text-red-400 animate-pulse" : ""}`}
                style={{ color: timeLeft <= 10 ? undefined : "#e8b56a" }}>
                {timeLeft}s
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* right area left empty for controls (e.g., volume button portal) */}
            </div>
          </div>

          {/* 主場景 */}
          <div className="flex-1 relative overflow-hidden">

            {/* 背景佔位 */}
            {/*<Placeholder label="[決戰背景圖]" className="absolute inset-0" />*/}
            <>
              <img
                src="/images/bg_battle.png"
                alt="決戰背景"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </>

            {/* ── 符文展示框（中央偏上） ── */}
            <AnimatePresence mode="wait">
              <motion.div key={spellIdx}
                initial={{ scale: 0.6, opacity: 0, y: -8 }}
                animate={{ scale: 1,   opacity: 1, y: 0  }}
                exit={{   scale: 1.2,  opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 pointer-events-none"
              >
                <div className={`flex flex-col items-center gap-1 px-8 py-3 border-2 transition-opacity duration-300 ${
                  canDraw ? "opacity-100" : "opacity-50 animate-pulse"
                }`}
                  style={{
                    borderColor: currentSpell.color,
                    background: `${currentSpell.color}18`,
                    boxShadow: canDraw ? `0 0 28px ${currentSpell.color}44` : "none",
                  }}>
                  <span className="font-bold select-none leading-none" style={{
                    fontSize: "4.5rem",
                    color: currentSpell.color,
                    textShadow: canDraw ? `0 0 20px ${currentSpell.color}` : "none",
                  }}>
                    {currentSpell.glyph}
                  </span>
                  <span className="font-title text-sm tracking-widest" style={{ color: currentSpell.color }}>
                    {currentSpell.name}
                  </span>
                  <span className="font-ui text-xs text-stone-400">{currentSpell.hint}</span>
                  <span className="font-ui text-[10px] text-stone-500 mt-0.5">
                    {canDraw ? "在畫面上畫出此形狀" : "準備中……"}
                  </span>
                </div>

                {/* 命中 / 失誤 提示（符文框正下方，不遮畫布） */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      key={feedback}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 px-4 py-1 text-sm font-ui font-bold"
                      style={{ color: feedback === "correct" ? "#4ade80" : "#f87171" }}
                    >
                      {feedback === "correct" ? "命中" : "失誤  −5 秒"}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* debugInfo removed */}

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
                {/* bottom HP dots removed (now shown in HUD) */}
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
