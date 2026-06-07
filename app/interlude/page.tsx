"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActionButton from "../../component/ActionButton";

type Role = "acc" | "clear" | "perm";
type LineConfig = { text: string; role: Role; color?: string };

const LINES: LineConfig[] = [
  { text: "糖果屋太美好了，",     role: "perm" },
  { text: "美好得令人不安。",     role: "perm" },
  { text: "這裡的一切，",         role: "perm" },
  { text: "都值得懷疑。",         role: "perm", color: "#ef4444" },
];

const TYPE_DELAY      = 90;
const AFTER_ACC       = 600;
const AFTER_CLEAR_ROW = 1100;
const CLEAR_FADE_MS   = 460;
const CLEAR_SETTLE_MS = 240;
const AFTER_PERM      = 900;

type Phase = "typing" | "clearing";
type TempItem = { text: string; color?: string };

function playTypingClick(ctx: AudioContext) {
  const bufLen = Math.floor(ctx.sampleRate * 0.022);
  const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data   = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++)
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 6);
  const src  = ctx.createBufferSource(); src.buffer = buf;
  const bpf  = ctx.createBiquadFilter(); bpf.type = "bandpass";
  bpf.frequency.value = 2400; bpf.Q.value = 0.7;
  const gain = ctx.createGain(); gain.gain.value = 0.16 + Math.random() * 0.05;
  src.connect(bpf); bpf.connect(gain); gain.connect(ctx.destination);
  src.start();
}

export default function Interlude() {
  const [lineIdx,    setLineIdx]    = useState(0);
  const [charIdx,    setCharIdx]    = useState(0);
  const [phase,      setPhase]      = useState<Phase>("typing");
  const [tempZone,   setTempZone]   = useState<TempItem[]>([]);
  const [permZone,   setPermZone]   = useState<{ text: string; color?: string }[]>([]);
  const [fading,     setFading]     = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [started,    setStarted]    = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!started || lineIdx >= LINES.length) return;
    const line = LINES[lineIdx];

    if (phase === "typing") {
      if (charIdx < line.text.length) {
        const t = setTimeout(() => {
          try {
            if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
            const ctx = audioCtxRef.current;
            if (ctx.state === "suspended") ctx.resume();
            playTypingClick(ctx);
          } catch (_) {}
          setCharIdx(c => c + 1);
        }, TYPE_DELAY);
        return () => clearTimeout(t);
      }

      const delay = line.role === "clear" ? AFTER_CLEAR_ROW
                  : line.role === "perm"  ? AFTER_PERM
                  : AFTER_ACC;

      const t = setTimeout(() => {
        if (line.role === "acc") {
          setTempZone(z => [...z, { text: line.text, color: line.color }]);
          setLineIdx(i => i + 1); setCharIdx(0);
        } else if (line.role === "clear") {
          setTempZone(z => [...z, { text: line.text, color: line.color }]);
          setFading(true); setPhase("clearing");
        } else {
          setPermZone(z => [...z, { text: line.text, color: line.color }]);
          const next = lineIdx + 1;
          setLineIdx(next); setCharIdx(0);
          if (next >= LINES.length) setTimeout(() => setShowButton(true), 900);
        }
      }, delay);
      return () => clearTimeout(t);
    }

    if (phase === "clearing") {
      const t = setTimeout(() => {
        setTempZone([]); setFading(false);
        setLineIdx(i => i + 1); setCharIdx(0); setPhase("typing");
      }, CLEAR_FADE_MS + CLEAR_SETTLE_MS);
      return () => clearTimeout(t);
    }
  }, [started, lineIdx, charIdx, phase]);

  const currentLine  = lineIdx < LINES.length && phase === "typing" ? LINES[lineIdx] : null;
  const displayText  = currentLine ? currentLine.text.slice(0, charIdx) : "";

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center relative overflow-hidden px-8">
      <div
        className="absolute inset-0 bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/ch01_bg.png')", backgroundSize: "auto 100%" }}
      />
      <div className="absolute inset-0 bg-black/82" />

      <div className="flex-38" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col gap-3">

        {/* 永久留存 */}
        <div className="flex flex-col gap-2">
          {permZone.map((item, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
              className={`font-title font-bold text-6xl leading-tight${i === 2 ? " mt-10" : ""}`}
              style={{ color: item.color ?? "#ffffff" }}
            >
              {item.text}
            </motion.p>
          ))}
        </div>

        {/* 暫存區：整組淡出 */}
        {tempZone.length > 0 && (
          <motion.div
            animate={{ opacity: fading ? 0 : 1, y: fading ? -12 : 0 }}
            transition={{ duration: CLEAR_FADE_MS / 1000, ease: "easeIn" }}
            className="flex flex-col gap-2"
          >
            {tempZone.map((item, i) => (
              <p key={i} className="font-title font-bold text-6xl leading-tight"
                style={{ color: item.color ?? "rgba(255,255,255,0.55)" }}>
                {item.text}
              </p>
            ))}
          </motion.div>
        )}

        {/* 正在打字的行 */}
        {currentLine && (
          <p className={`font-title font-bold text-6xl leading-tight${lineIdx === 2 ? " mt-10" : ""}`}
            style={{ color: currentLine.color ?? "#ffffff", minHeight: "1.15em" }}>
            {displayText}
            <span
              className="inline-block w-0.75 h-[0.8em] align-middle ml-1"
              style={{ background: currentLine.color ?? "white", animation: "pulse 0.9s ease-in-out infinite", opacity: 0.9 }}
            />
          </p>
        )}

        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-8 flex items-center justify-end"
            >
              <ActionButton text="探索屋子" href="/explore" variant="gold" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-62" />
    </div>
  );
}
