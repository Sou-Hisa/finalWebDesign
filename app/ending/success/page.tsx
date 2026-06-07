"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Img from "next/image";
import { useGameStore } from "../../../store/store";
import ActionButton from "../../../component/ActionButton";

const LINES = [
  "趁著女巫靠近火爐，你們用盡全力將她推了進去！",
  "「啊——！」",
  "女巫慘叫著跌入熊熊烈火中，化為灰燼。",
  "危機解除了。你們在屋子深處發現了女巫藏匿的金銀珠寶。",
  "帶著這些寶藏，你們牽著手逃出糖果屋，循著晨光終於找到了回家的路。",
  "從此，一家人過著不再挨餓的幸福日子。",
];

const ITALIC_LINES    = new Set([1]);
const HIGHLIGHT_LINES = new Set([5]);
const CHAR_DELAY = 42;
const LINE_PAUSE = 700;

export default function EndingSuccess() {
  const router    = useRouter();
  const resetGame = useGameStore((s) => s.resetGame);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [doneLines,  setDoneLines]  = useState<string[]>([]);
  const [lineIdx,    setLineIdx]    = useState(0);
  const [charIdx,    setCharIdx]    = useState(0);
  // typing → fadeOut → reveal
  const [phase, setPhase] = useState<"typing" | "fadeOut" | "reveal">("typing");

  function getAudioCtx() {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch { return null; }
  }

  function playTypingClick() {
    const ctx = getAudioCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    const bufLen = Math.floor(ctx.sampleRate * 0.022);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random()*2-1) * Math.pow(1 - i/bufLen, 6);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bpf = ctx.createBiquadFilter(); bpf.type = "bandpass";
    bpf.frequency.value = 2400; bpf.Q.value = 0.7;
    const g = ctx.createGain(); g.gain.value = 0.13 + Math.random() * 0.05;
    src.connect(bpf); bpf.connect(g); g.connect(ctx.destination);
    src.start(now);
  }

  // 打字機
  useEffect(() => {
    if (phase !== "typing") return;
    if (lineIdx >= LINES.length) {
      // 字打完後等 2s 再開始淡出
      const t = setTimeout(() => setPhase("fadeOut"), 2000);
      return () => clearTimeout(t);
    }
    const line = LINES[lineIdx];
    if (charIdx >= line.length) {
      const t = setTimeout(() => {
        setDoneLines((prev) => [...prev, line]);
        setLineIdx((i) => i + 1);
        setCharIdx(0);
      }, LINE_PAUSE);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      playTypingClick();
      setCharIdx((c) => c + 1);
    }, CHAR_DELAY);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIdx, charIdx, phase]);

  // fadeOut 完成後進入 reveal
  function handleFadeOutComplete() {
    if (phase === "fadeOut") setPhase("reveal");
  }

  const currentTyping = lineIdx < LINES.length ? LINES[lineIdx].slice(0, charIdx) : null;

  return (
    <div className="w-full h-screen relative flex items-center justify-center overflow-hidden bg-stone-950">

      {/* 背景圖：reveal 時完整顯現 */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: phase === "reveal" ? 1 : 0.25 }}
        transition={{ duration: 1.4 }}
      >
        <Img
          src="/images/ending_success.png"
          alt=""
          fill
          className="object-cover pointer-events-none select-none"
          priority
        />
      </motion.div>

      {/* 遮罩：reveal 時淡出 */}
      <motion.div
        className="absolute inset-0 bg-stone-950 pointer-events-none"
        animate={{ opacity: phase === "reveal" ? 0 : 0.6 }}
        transition={{ duration: 1.4 }}
      />

      {/* 打字機文字：fadeOut 時整塊淡出 */}
      <AnimatePresence onExitComplete={handleFadeOutComplete}>
        {phase === "typing" && (
          <motion.div
            key="text"
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="relative z-10 w-full max-w-5xl px-8 flex flex-col gap-6 font-body text-3xl leading-loose"
          >
            {doneLines.map((line, i) => (
              <p key={i}
                className={`text-balance${ITALIC_LINES.has(i) ? " italic" : ""}`}
                style={{
                  color: HIGHLIGHT_LINES.has(i) ? "var(--color-gold)"
                       : ITALIC_LINES.has(i)    ? "#fca5a5"
                       : "#e7e5e4",
                  fontWeight: HIGHLIGHT_LINES.has(i) ? 800 : undefined,
                  fontSize:   HIGHLIGHT_LINES.has(i) ? "3rem" : undefined,
                }}
              >
                {line}
              </p>
            ))}
            {currentTyping !== null && (
              <p
                className={`text-balance${ITALIC_LINES.has(lineIdx) ? " italic" : ""}`}
                style={{
                  color:      HIGHLIGHT_LINES.has(lineIdx) ? "var(--color-gold)"
                            : ITALIC_LINES.has(lineIdx)    ? "#fca5a5"
                            : "#e7e5e4",
                  fontWeight: HIGHLIGHT_LINES.has(lineIdx) ? 800 : undefined,
                  fontSize:   HIGHLIGHT_LINES.has(lineIdx) ? "3rem" : undefined,
                }}
              >
                {currentTyping}
                <span className="animate-pulse text-amber-300">|</span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部漸層（按鈕區對比保底） */}
      <div className="absolute bottom-0 inset-x-0 h-36 bg-linear-to-t from-stone-950/75 to-transparent pointer-events-none z-10" />

      {/* reveal 後浮出按鈕 */}
      <AnimatePresence>
        {phase === "reveal" && (
          <motion.div
            key="btn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="absolute bottom-12 z-20"
          >
            <ActionButton
              onClick={() => { resetGame(); router.push("/"); }}
              variant="gold"
            >
              再玩一次
            </ActionButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
