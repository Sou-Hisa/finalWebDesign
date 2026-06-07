"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Img from "next/image";
import ActionButton from "../../../component/ActionButton";

const LINES = [
  "你們的動作慢了一步，女巫強大的黑魔法將你們牢牢困住。",
  "「嘿嘿，多麼鮮嫩的肉啊……」",
  "幾天後，糖果屋的角落裡，又多出了兩副小小的白骨。",
  "屋子依舊散發著甜美的香氣，靜靜地等待著下一批迷路的獵物……",
];

const ITALIC_LINES     = new Set([1, 3]);
const DIM_LINES        = new Set([3]);
const HIGHLIGHT_LINES  = new Set([3]);
const CHAR_DELAY = 46;
const LINE_PAUSE = 750;

export default function EndingFail() {
  const router = useRouter();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [doneLines, setDoneLines] = useState<string[]>([]);
  const [lineIdx,   setLineIdx]   = useState(0);
  const [charIdx,   setCharIdx]   = useState(0);
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
    bpf.frequency.value = 1800; bpf.Q.value = 0.8;
    const g = ctx.createGain(); g.gain.value = 0.12 + Math.random() * 0.04;
    src.connect(bpf); bpf.connect(g); g.connect(ctx.destination);
    src.start(now);
  }

  useEffect(() => {
    if (phase !== "typing") return;
    if (lineIdx >= LINES.length) {
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

  function handleFadeOutComplete() {
    if (phase === "fadeOut") setPhase("reveal");
  }

  const currentTyping = lineIdx < LINES.length ? LINES[lineIdx].slice(0, charIdx) : null;

  return (
    <div className="w-full h-screen relative flex items-center justify-center overflow-hidden bg-stone-950">

      {/* 背景圖：reveal 時完整顯現 */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: phase === "reveal" ? 1 : 0.20 }}
        transition={{ duration: 1.4 }}
      >
        <Img
          src="/images/ending_fail.png"
          alt=""
          fill
          className="object-cover pointer-events-none select-none"
          priority
        />
      </motion.div>

      {/* 遮罩：reveal 時淡出 */}
      <motion.div
        className="absolute inset-0 bg-stone-950 pointer-events-none"
        animate={{ opacity: phase === "reveal" ? 0 : 0.65 }}
        transition={{ duration: 1.4 }}
      />

      {/* 打字機文字 */}
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
                  color:      DIM_LINES.has(i)    ? "#78716c"
                            : ITALIC_LINES.has(i) ? "#86efac"
                            : "#d6d3d1",
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
                  color:      DIM_LINES.has(lineIdx)    ? "#78716c"
                            : ITALIC_LINES.has(lineIdx) ? "#86efac"
                            : "#d6d3d1",
                  fontWeight: HIGHLIGHT_LINES.has(lineIdx) ? 800 : undefined,
                  fontSize:   HIGHLIGHT_LINES.has(lineIdx) ? "3rem" : undefined,
                }}
              >
                {currentTyping}
                <span className="animate-pulse text-red-500">|</span>
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
              onClick={() => router.push("/battle")}
              variant="red"
              className="px-10 py-3 font-ui font-bold tracking-wider"
            >
              再試一次
            </ActionButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
