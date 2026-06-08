"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";
import ActionButton from "../../component/ActionButton";
import Img from "next/image";

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
  id: SpellId;
  glyph: string;
  name: string;
  hint: string;
  color: string;
}

const SPELLS: Spell[] = [
  { id: "V", glyph: "V", name: "V 形斬", hint: "往下再往右上", color: "#60a5fa" },
  { id: "circle", glyph: "◉", name: "封印陣", hint: "畫一個完整的圓", color: "#c084fc" },
  { id: "Z", glyph: "Z", name: "Z 形咒", hint: "往右、斜左下、再往右", color: "#34d399" },
  { id: "N", glyph: "N", name: "N 形紋", hint: "往上、斜右下、再往上", color: "#fbbf24" },
  { id: "L", glyph: "L", name: "L 形術", hint: "往下再往右", color: "#f472b6" },
  { id: "mountain", glyph: "∧", name: "山形紋", hint: "往右上再往右下", color: "#fb923c" },
  { id: "seven", glyph: "7", name: "七形術", hint: "往右再斜左下", color: "#e879f9" },
];

function shuffleSpells(): Spell[] {
  const arr = [...SPELLS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const TOTAL_HP = 5;
const TIME_LIMIT = 55;

// ── 決戰說明打字機文案 ──────────────────────────────────────
const INTRO_LINES = [
  "她怎麼可能就這樣讓你們逃走——",
  "火爐的熱浪撲面而來。",
  "你握緊了手中的魔杖，",
  "深吸一口氣。",
  "跟著符文，在空中揮出魔法。",
  "在她對你們下手之前。",
] as const;
const INTRO_CHAR_DELAY = 52;

type Point = { x: number; y: number };

// ── 符文引導路徑（畫在 canvas 底層，玩家跟著描） ───────────────
const GUIDE_PATHS: Record<SpellId, (c: CanvasRenderingContext2D, w: number, h: number) => void> = {
  V: (c, w, h) => { c.moveTo(w * .36, h * .33); c.lineTo(w * .50, h * .64); c.lineTo(w * .64, h * .33); },
  circle: (c, w, h) => { c.arc(w * .50, h * .50, Math.min(w, h) * .18, 0, Math.PI * 2); },
  Z: (c, w, h) => { c.moveTo(w * .35, h * .34); c.lineTo(w * .65, h * .34); c.lineTo(w * .35, h * .66); c.lineTo(w * .65, h * .66); },
  N: (c, w, h) => { c.moveTo(w * .37, h * .66); c.lineTo(w * .37, h * .34); c.lineTo(w * .63, h * .66); c.lineTo(w * .63, h * .34); },
  L: (c, w, h) => { c.moveTo(w * .43, h * .34); c.lineTo(w * .43, h * .66); c.lineTo(w * .64, h * .66); },
  mountain: (c, w, h) => { c.moveTo(w * .32, h * .66); c.lineTo(w * .50, h * .34); c.lineTo(w * .68, h * .66); },
  seven: (c, w, h) => { c.moveTo(w * .35, h * .34); c.lineTo(w * .65, h * .34); c.lineTo(w * .37, h * .68); },
};

function drawSpellGuide(canvas: HTMLCanvasElement, spell: Spell) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.strokeStyle = spell.color;
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = 20;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.setLineDash([24, 14]);
  GUIDE_PATHS[spell.id](ctx, canvas.width, canvas.height);
  ctx.stroke();
  ctx.restore();
}

// ══════════════════════════════════════════════════════════
//  多段形狀偵測（分段分析向量方向）
// ══════════════════════════════════════════════════════════
function detectSpell(pts: Point[], cw: number, ch: number): SpellId | null {
  if (pts.length < 8) return null;

  // ── 1. 累積弧長（arc-length parameterization） ─────────
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
    cum.push(cum[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  const totalLen = cum[cum.length - 1];
  const diagLen = Math.sqrt(cw * cw + ch * ch);
  if (totalLen < diagLen * 0.07) return null;

  const n = pts.length;

  // ── 2. 5-point 滑動平均，降低噪點對極值的影響 ─────────
  const W = 4;
  const sx: number[] = [], sy: number[] = [];
  for (let i = 0; i < n; i++) {
    let sumX = 0, sumY = 0, cnt = 0;
    for (let j = Math.max(0, i - W); j <= Math.min(n - 1, i + W); j++) {
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
  const topT = cum[minYIdx] / totalLen;
  const rightT = cum[maxXIdx] / totalLen;

  const totalH = sy[maxYIdx] - sy[minYIdx];
  const totalW = sx[maxXIdx] - sx[minXIdx];
  const minSpan = diagLen * 0.07;

  // ── 4. 按弧長插值，取路徑上任意比例位置的點 ──────────
  function atT(t: number): Point {
    const target = t * totalLen;
    let lo = 0;
    while (lo < n - 2 && cum[lo + 1] < target) lo++;
    const span = cum[lo + 1] - cum[lo];
    const frac = span > 0 ? (target - cum[lo]) / span : 0;
    return {
      x: pts[lo].x + (pts[lo + 1].x - pts[lo].x) * frac,
      y: pts[lo].y + (pts[lo + 1].y - pts[lo].y) * frac,
    };
  }

  const first = pts[0], last = pts[n - 1];
  const endDist = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2);

  // ── 圓形：起終點很近，路徑夠長 ──────────────────────
  if (endDist < diagLen * 0.15 && totalLen > diagLen * 0.17) return "circle";

  // ── V：最低點在路徑中段（20%~80%），兩端都明顯高於最低點 ──
  if (
    totalH > minSpan &&
    bottomT > 0.2 && bottomT < 0.8 &&
    sy[maxYIdx] - sy[0] > totalH * 0.3 &&
    sy[maxYIdx] - sy[n - 1] > totalH * 0.3
  ) return "V";

  // ── 山形 ∧：最高點在路徑中段，兩端都明顯低於最高點 ──
  if (
    totalH > minSpan &&
    topT > 0.2 && topT < 0.8 &&
    sy[0] - sy[minYIdx] > totalH * 0.3 &&
    sy[n - 1] - sy[minYIdx] > totalH * 0.3
  ) return "mountain";

  // ── 七形 7：最右點在路徑前半，之後向左且向下 ─────────
  if (
    totalW > minSpan &&
    rightT > 0.1 && rightT < 0.62 &&
    sx[maxXIdx] - sx[0] > totalW * 0.25 &&  // 有向右筆畫
    sx[maxXIdx] - sx[n - 1] > totalW * 0.15 &&  // 終點在最右點左邊
    sy[n - 1] - sy[maxXIdx] > minSpan * 0.4 // 終點在最右點下方
  ) return "seven";

  // ── L：最低點在路徑後段（35%後），最低點之後繼續往右 ─
  if (
    totalH > minSpan &&
    bottomT > 0.35 && bottomT < 0.88 &&
    sx[n - 1] - sx[maxYIdx] > totalW * 0.2 &&
    sy[n - 1] - sy[0] > totalH * 0.3
  ) return "L";

  // ── Z / N：使用 20%/60% 切點，更符合橫短斜長的筆畫比例 ──
  // Z 橫線短（各佔~25%）、斜線長（~50%）；用三等分 0.33/0.67 會讓斜線占滿兩段
  const pA = atT(0.20), pB = atT(0.60);
  const sA = { dx: pA.x - first.x, dy: pA.y - first.y };
  const sB = { dx: pB.x - pA.x, dy: pB.y - pA.y };
  const sC = { dx: last.x - pB.x, dy: last.y - pB.y };
  const m = diagLen * 0.04;

  if (sA.dx > m && sB.dx < -m && sB.dy > m && sC.dx > m) return "Z";
  if (sA.dy < -m && sB.dy > m && sB.dx > m && sC.dy < -m) return "N";

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
  const router = useRouter();
  const dialogues = useGameStore((s) => s.battleDialogues);

  const [phase, setPhase] = useState<Phase>("dialogue");
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [witchHp, setWitchHp] = useState(TOTAL_HP);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [spellIdx, setSpellIdx] = useState(0);
  const [spellQueue, setSpellQueue] = useState<Spell[]>(() => shuffleSpells());
  const [feedback, setFeedback] = useState<"wrong" | null>(null);
  const [screenFlash, setScreenFlash] = useState(false);
  const [canDraw, setCanDraw] = useState(false);
  const [hitFx, setHitFx] = useState<{ id: number; color: string } | null>(null);

  // 決戰說明打字機
  const [introLineIdx, setIntroLineIdx] = useState(0);
  const [introCharIdx, setIntroCharIdx] = useState(0);
  const [showStartBtn, setShowStartBtn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const points = useRef<Point[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPt = useRef<Point | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  function getAudioCtx(): AudioContext | null {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch { return null; }
  }

  function playHitSound() {
    const ctx = getAudioCtx(); if (!ctx) return;
    const now = ctx.currentTime;

    // 混響：delay feedback loop
    const rev = ctx.createDelay(1.0); rev.delayTime.value = 0.13;
    const revFb = ctx.createGain(); revFb.gain.value = 0.38;
    const revWet = ctx.createGain(); revWet.gain.value = 0.28;
    rev.connect(revFb); revFb.connect(rev); rev.connect(revWet); revWet.connect(ctx.destination);

    // Whoosh：噪音帶通從低到高掃
    const nLen = Math.floor(ctx.sampleRate * 0.11);
    const nBuf = ctx.createBuffer(1, nLen, ctx.sampleRate);
    const nd = nBuf.getChannelData(0);
    for (let i = 0; i < nLen; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nLen, 0.6);
    const nSrc = ctx.createBufferSource(); nSrc.buffer = nBuf;
    const nbpf = ctx.createBiquadFilter(); nbpf.type = "bandpass";
    nbpf.frequency.setValueAtTime(250, now);
    nbpf.frequency.exponentialRampToValueAtTime(5000, now + 0.10);
    nbpf.Q.value = 2.5;
    const ng = ctx.createGain(); ng.gain.value = 0.38;
    nSrc.connect(nbpf); nbpf.connect(ng); ng.connect(ctx.destination); ng.connect(rev);
    nSrc.start(now);

    // 和弦 triangle：whoosh 後起聲，帶混響尾音
    [330, 495, 660, 990].forEach((f, i) => {
      const osc = ctx.createOscillator(); osc.type = "triangle";
      osc.frequency.setValueAtTime(f * 1.6, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(f, now + 0.2); // 降到目標音
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now + 0.07);
      g.gain.linearRampToValueAtTime(0.17 - i * 0.03, now + 0.14);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc.connect(g); g.connect(ctx.destination); g.connect(rev);
      osc.start(now + 0.07); osc.stop(now + 0.85);
    });
  }

  function playMissSound() {
    const ctx = getAudioCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    // 低沉撞擊 + 不諧和雙音
    const thud = ctx.createOscillator(); thud.type = "sine";
    thud.frequency.setValueAtTime(95, now);
    thud.frequency.exponentialRampToValueAtTime(45, now + 0.18);
    const tg = ctx.createGain(); tg.gain.setValueAtTime(0.48, now); tg.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    thud.connect(tg); tg.connect(ctx.destination);
    thud.start(now); thud.stop(now + 0.22);

    [215, 228].forEach(f => {
      const osc = ctx.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = f;
      const lpf = ctx.createBiquadFilter(); lpf.type = "lowpass"; lpf.frequency.value = 700;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.1, now + 0.02); g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(lpf); lpf.connect(g); g.connect(ctx.destination);
      osc.start(now + 0.02); osc.stop(now + 0.28);
    });
  }

  function playTypingClick() {
    const ctx = getAudioCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    const bufLen = Math.floor(ctx.sampleRate * 0.022);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 6);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bpf = ctx.createBiquadFilter(); bpf.type = "bandpass";
    bpf.frequency.value = 2400; bpf.Q.value = 0.7;
    const g = ctx.createGain(); g.gain.value = 0.16 + Math.random() * 0.05;
    src.connect(bpf); bpf.connect(g); g.connect(ctx.destination);
    src.start(now);
  }

  function playHeartbeat(remaining: number) {
    const ctx = getAudioCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    const intensity = Math.max(0, 1 - remaining / 20); // 0 at 20s → 1 at 0s
    // lub
    const lub = ctx.createOscillator(); lub.type = "sine";
    lub.frequency.setValueAtTime(60 + intensity * 25, now);
    const lg = ctx.createGain(); lg.gain.setValueAtTime(0.22 + intensity * 0.18, now); lg.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    lub.connect(lg); lg.connect(ctx.destination); lub.start(now); lub.stop(now + 0.13);
    // dub（0.15s 後，稍輕）
    const dub = ctx.createOscillator(); dub.type = "sine";
    dub.frequency.setValueAtTime(48 + intensity * 18, now + 0.15);
    const dg = ctx.createGain(); dg.gain.setValueAtTime(0.15 + intensity * 0.12, now + 0.15); dg.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    dub.connect(dg); dg.connect(ctx.destination); dub.start(now + 0.15); dub.stop(now + 0.28);
  }

  const endBattle = useCallback((win: boolean) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    router.push(win ? "/ending/success" : "/ending/fail");
  }, [router]);

  useEffect(() => {
    if (phase !== "battle") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { endBattle(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, endBattle]);

  // 心跳音：≤20s 開始，每秒 lub-dub，越緊張越響
  useEffect(() => {
    if (phase !== "battle" || timeLeft > 20 || timeLeft <= 0) return;
    playHeartbeat(timeLeft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  // 決戰說明打字機
  useEffect(() => {
    if (phase !== "intro") return;
    if (introLineIdx >= INTRO_LINES.length) { setTimeout(() => setShowStartBtn(true), 400); return; }
    const line = INTRO_LINES[introLineIdx];
    if (introCharIdx < line.length) {
      const t = setTimeout(() => {
        playTypingClick();
        setIntroCharIdx(c => c + 1);
      }, INTRO_CHAR_DELAY);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setIntroLineIdx(i => i + 1); setIntroCharIdx(0); }, 500);
    return () => clearTimeout(t);
  }, [phase, introLineIdx, introCharIdx]);

  // 每當符文切換，短暫鎖定畫布，並畫出引導路徑
  useEffect(() => {
    if (phase !== "battle") return;
    const t = setTimeout(() => {
      setCanDraw(true);
      const spell = spellQueue[spellIdx % spellQueue.length];
      if (canvasRef.current) drawSpellGuide(canvasRef.current, spell);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spellIdx, phase]);

  function getPos(e: React.MouseEvent | React.TouchEvent): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
    if ("touches" in e)
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (phase !== "battle" || !canDraw) return;
    const pos = getPos(e);
    drawing.current = true; points.current = [pos]; lastPt.current = pos;
    const canvas = canvasRef.current; if (!canvas) return;
    // 重繪引導（clearRect + guide），讓筆畫疊在引導上
    drawSpellGuide(canvas, currentSpell);
    const ctx = canvas.getContext("2d"); if (!ctx) return;
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
    const spell = spellQueue[spellIdx % spellQueue.length];
    // debug info removed in production UI
    points.current = [];

    if (matched === spell.id) {
      playHitSound();
      if (lastPt.current) spawnParticles(particleCanvasRef.current ?? canvas, lastPt.current.x, lastPt.current.y, spell.color);
      setHitFx({ id: Date.now(), color: spell.color });
      setTimeout(() => setHitFx(null), 500);
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
      }
    } else {
      playMissSound();
      setFeedback("wrong"); setScreenFlash(true);
      setTimeLeft((t) => Math.max(0, t - 5));
      setTimeout(() => {
        setFeedback(null); setScreenFlash(false);
        const spell = spellQueue[spellIdx % spellQueue.length];
        drawSpellGuide(canvas, spell); // 錯誤後重繪引導
      }, 600);
    }
  }

  const isLastDialogue = dialogueIndex === dialogues.length - 1;
  const currentSpell = spellQueue[spellIdx % spellQueue.length];

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
          <div className="flex-1 relative bg-black">
            <Img
              src="/images/battle_bg1.png"
              alt="決戰場景背景"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              width={1920} height={1080}
            />
            {/* 角色：3:4 比例 */}
            <div className="absolute bottom-25 left-1/2 -translate-x-1/2 flex gap-10 items-end pb-2">
              {/* 葛麗特 */}
              <div className="relative w-45 h-60">
                <Img src="/item_images/gretel_fight.png" alt="葛麗特" fill className="object-contain" />
              </div>


              {/* 女巫 */}
              <div className="relative w-45 h-70">
                <Img 
                  src="/item_images/witch.png" 
                  alt="女巫" 
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain" 
                />
              </div>
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

      {/* ════ 決戰說明：打字機 ════ */}
      {phase === "intro" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8">
          {/* 背景透出 */}
          <Img src="/images/battle_bg2.png" alt=""
            width={1920} height={1080}
            className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-start w-full max-w-2xl gap-3 mb-10">
            {/* 已完成的行 */}
            {INTRO_LINES.slice(0, introLineIdx).map((line, i) => (
              <p key={i}
                className="font-title font-bold text-4xl leading-snug"
                style={{ color: i === INTRO_LINES.length - 1 ? "#ef4444" : "rgba(255,255,255,0.7)" }}>
                {line}
              </p>
            ))}
            {/* 正在打字的行 */}
            {introLineIdx < INTRO_LINES.length && (
              <p className="font-title font-bold text-4xl leading-snug" style={{ color: "#ffffff" }}>
                {INTRO_LINES[introLineIdx].slice(0, introCharIdx)}
                <span className="inline-block w-0.5 h-[0.85em] align-middle ml-0.5 bg-white opacity-80"
                  style={{ animation: "pulse 0.9s ease-in-out infinite" }} />
              </p>
            )}
          </div>

          <AnimatePresence>
            {showStartBtn && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 flex gap-8"
              >
                <ActionButton
                  href="/ending/fail"
                  variant="white"
                  className="px-12 py-3"
                >
                  撤離
                </ActionButton>

                <ActionButton
                  onClick={() => { setCanDraw(false); setPhase("battle"); }}
                  variant="red"
                  className="px-12 py-3"
                >
                  施法
                </ActionButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ════ 決戰場景 ════ */}
      {phase === "battle" && (
        <>
          {/* HUD：固定高度，不隨 timeLeft 變化 */}
          <div className="flex items-center justify-center h-9 shrink-0">
            <span
              className={`font-ui font-bold tabular-nums text-base tracking-widest transition-colors duration-300
                ${timeLeft <= 10 ? "text-red-400 animate-pulse" : ""}`}
              style={{ color: timeLeft <= 10 ? undefined : "#e8b56a" }}
            >
              {timeLeft}s
            </span>
          </div>

          {/* 主場景 */}
          <div className="flex-1 relative overflow-hidden">

            <Img
              src="/images/battle_bg2.png"
              alt="決戰背景"
              className="absolute inset-0 w-full h-full object-cover"
              width={1920} height={1080}
            />
            <div className="absolute inset-0 bg-black/30" />

            {/* ── 時間讀條（絕對定位在場景頂端，往下長，不影響 layout） ── */}
            <div
              className="absolute top-0 left-0 w-full z-20 pointer-events-none overflow-hidden transition-[height] duration-500"
              style={{ height: 3 }}
            >
              <div
                className={`h-full transition-[width] duration-1000 ease-linear ${timeLeft <= 10 ? "timer-critical" : ""}`}
                style={{
                  width: `${(timeLeft / TIME_LIMIT) * 100}%`,
                  background: timeLeft > 30
                    ? "linear-gradient(90deg, #16a34a, #4ade80)"
                    : timeLeft > 15
                      ? "linear-gradient(90deg, #c2410c, #fb923c)"
                      : "linear-gradient(90deg, #7f1d1d, #ef4444, #fca5a5)",
                }}
              />
            </div>

            {/* ── 緊張氛圍：時間越少邊框越紅、畫面越暗 ── */}
            {(() => {
              // 從剩餘 70% 時間開始漸增，到 0s 時強度最高
              const urgency = Math.max(0, Math.min(1, (TIME_LIMIT * 0.7 - timeLeft) / (TIME_LIMIT * 0.7)));
              if (urgency <= 0) return null;
              const borderAlpha = urgency * 0.70;
              const darkAlpha = urgency * 0.32;
              const spread = 40 + urgency * 90;
              return (
                <>
                  {/* 紅暗色調覆蓋 */}
                  <div className="absolute inset-0 z-5 pointer-events-none transition-all duration-1000"
                    style={{ background: `rgba(55, 0, 0, ${darkAlpha})` }} />
                  {/* 邊框暈染 */}
                  <div
                    className={`absolute inset-0 z-40 pointer-events-none transition-all duration-1000${timeLeft <= 10 ? " timer-critical" : ""}`}
                    style={{ boxShadow: `inset 0 0 ${spread}px rgba(220, 20, 10, ${borderAlpha})` }}
                  />
                </>
              );
            })()}

            {/* ── 失誤提示 ── */}
            <AnimatePresence>
              {feedback === "wrong" && (
                <motion.div
                  key="wrong"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none px-4 py-1 text-sm font-ui font-bold"
                  style={{ color: "#f87171" }}
                >
                  失誤  −5 秒
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── 命中攻擊特效：從中央飛向左下女巫 ── */}
            <AnimatePresence>
              {hitFx && (
                <motion.div
                  key={hitFx.id}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1.2 }}
                  animate={{ x: "-38vw", y: "55vh", opacity: 0, scale: 0.3 }}
                  transition={{ duration: 0.42, ease: "easeIn" }}
                  className="absolute z-30 pointer-events-none w-20 h-20 rounded-full"
                  style={{
                    left: "calc(50% - 40px)", top: "8%",
                    background: `radial-gradient(circle, ${hitFx.color}cc 0%, ${hitFx.color}00 70%)`,
                    boxShadow: `0 0 30px ${hitFx.color}88`,
                  }}
                />
              )}
            </AnimatePresence>

            {/* ── 粒子 Canvas（在繪圖層下方，避免干擾引導圖） ── */}
            <canvas ref={particleCanvasRef} width={800} height={600}
              className="absolute inset-0 w-full h-full pointer-events-none z-9"
            />

            {/* ── 繪圖 Canvas（覆蓋全場景） ── */}
            <canvas ref={canvasRef} width={800} height={600}
              className="absolute inset-0 w-full h-full cursor-crosshair touch-none z-10"
              onMouseDown={startDraw} onMouseMove={continueDraw}
              onMouseUp={endDraw} onMouseLeave={endDraw}
              onTouchStart={startDraw} onTouchMove={continueDraw} onTouchEnd={endDraw}
            />

            {/* ── 角色（底部橫排，3:4 比例） ── */}
            <div className="absolute bottom-0 w-full flex items-end justify-between px-6 pb-2 pointer-events-none z-8">
              
              <div className="flex flex-col items-center gap-1">
                {/* 葛麗特 */}
                <div className="relative w-28 h-36">
                  <Img
                    src="/item_images/gretel_fight.png"
                    alt="葛麗特"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </div>
              </div>

              {/* 火爐 
              <Placeholder label="[火爐]" className="w-28 h-28" />*/}

              {/* 女巫 */}
              <div className="relative w-32 h-43">
                <Img
                  src={witchHp > 0 ? "/item_images/witch.png" : "[女巫倒下]"}
                  alt="女巫"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>

            </div>

          </div>
        </>
      )}
    </div>
  );
}
