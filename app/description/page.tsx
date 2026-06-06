"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActionButton from "../../component/ActionButton";

type Role = "acc" | "clear" | "perm";
type LineConfig = { text: string; role: Role; color?: string };

const LINES: LineConfig[] = [
  // 第一組：饑荒背景
  { text: "那一年鬧大饑荒，",           role: "acc"   },
  { text: "家裡的食物一天比一天少。",   role: "clear" },

  // 第二組：遺棄
  { text: "一天夜裡，",                 role: "acc"   },
  { text: "我和哥哥被帶進了森林，",     role: "acc"   },
  { text: "狠心地，遺棄在那裡。",       role: "clear" },

  // 第三組：白石子的希望（最關鍵——打完後整組消失）
  { text: "哥哥沿路撒下了小石子，",     role: "acc"   },
  { text: "我們循著月光回了家。",       role: "clear" },

  // 第四組：末路
  { text: "可是這一次，",               role: "acc"   },
  { text: "麵包屑被鳥兒啄光了，",       role: "acc"   },
  { text: "我們再也回不去了。",         role: "clear", color: "#ef4444" }, // 只保留這一個顏色強調

  // 永久留存：糖果屋
  { text: "眼前出現了一棟房子。",       role: "perm"  },
  { text: "牆是餅乾，屋頂鋪滿糖果，",   role: "perm"  },
  { text: "我們忍不住走了進去……",       role: "perm"  },
];

const TYPE_DELAY      = 70;
const AFTER_ACC       = 460;
const AFTER_CLEAR_ROW = 1000;
const CLEAR_FADE_MS   = 480;
const CLEAR_SETTLE_MS = 260;
const AFTER_PERM      = 520;

type Phase = "typing" | "clearing";
type TempItem = { text: string; color?: string };

// 用 Web Audio API 合成一個短促的打字點擊聲
function playTypingClick(ctx: AudioContext) {
  const bufLen = Math.floor(ctx.sampleRate * 0.022); // 22ms 白噪音
  const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const data   = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) {
    // 白噪音 + 快速指數衰減，模擬鍵盤觸底的短擊
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 6);
  }

  const src    = ctx.createBufferSource();
  src.buffer   = buf;

  // 帶通濾波：保留 1.5kHz–4kHz，讓音色清脆不刺耳
  const bpf    = ctx.createBiquadFilter();
  bpf.type     = "bandpass";
  bpf.frequency.value = 2400;
  bpf.Q.value  = 0.7;

  const gain   = ctx.createGain();
  // 每次輕微隨機音量，避免單調
  gain.gain.value = 0.18 + Math.random() * 0.06;

  src.connect(bpf);
  bpf.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

export default function Description() {
  const [lineIdx,    setLineIdx]    = useState(0);
  const [charIdx,    setCharIdx]    = useState(0);
  const [phase,      setPhase]      = useState<Phase>("typing");
  const [tempZone,   setTempZone]   = useState<TempItem[]>([]);
  const [permZone,   setPermZone]   = useState<string[]>([]);
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
          // 建立（或恢復）AudioContext，播放點擊聲
          try {
            if (!audioCtxRef.current) {
              audioCtxRef.current = new AudioContext();
            }
            const ctx = audioCtxRef.current;
            if (ctx.state === "suspended") ctx.resume();
            playTypingClick(ctx);
          } catch (_) { /* 不支援時靜默略過 */ }

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
          setLineIdx(i => i + 1);
          setCharIdx(0);
        } else if (line.role === "clear") {
          setTempZone(z => [...z, { text: line.text, color: line.color }]);
          setFading(true);
          setPhase("clearing");
        } else {
          // perm：推進 lineIdx，防止最後一行重複顯示
          setPermZone(z => [...z, line.text]);
          const next = lineIdx + 1;
          setLineIdx(next);
          setCharIdx(0);
          if (next >= LINES.length) {
            setTimeout(() => setShowButton(true), 800);
          }
        }
      }, delay);
      return () => clearTimeout(t);
    }

    if (phase === "clearing") {
      const t = setTimeout(() => {
        setTempZone([]);
        setFading(false);
        setLineIdx(i => i + 1);
        setCharIdx(0);
        setPhase("typing");
      }, CLEAR_FADE_MS + CLEAR_SETTLE_MS);
      return () => clearTimeout(t);
    }
  }, [started, lineIdx, charIdx, phase]);

  const currentLine = (lineIdx < LINES.length && phase === "typing")
    ? LINES[lineIdx] : null;
  const displayText = currentLine ? currentLine.text.slice(0, charIdx) : "";

  return (
    <div className="w-full h-screen bg-black flex flex-col items-center relative overflow-hidden px-8">
      {/* 背景圖  */}
      <div
        className="
          absolute inset-0
          bg-[url('/images/bg_description.png')]
          bg-center
          bg-no-repeat
        "
        style={{
          backgroundSize: "auto 100%",
        }}
      />

      {/* 深色遮罩，讓白字更凸顯 */}
      <div className="absolute inset-0 bg-black/60" />


      <div className="flex-38" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col gap-3">

        {/* 永久留存 */}
        <div className="flex flex-col gap-2">
          {permZone.map((text, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="font-title font-bold text-7xl leading-tight"
              style={{ color: "#ffffff" }}
            >
              {text}
            </motion.p>
          ))}
        </div>

        {/* 暫存區：整組一起淡出 */}
        {tempZone.length > 0 && (
          <motion.div
            animate={{ opacity: fading ? 0 : 1, y: fading ? -14 : 0 }}
            transition={{ duration: CLEAR_FADE_MS / 1000, ease: "easeIn" }}
            className="flex flex-col gap-2"
          >
            {tempZone.map((item, i) => (
              <p
                key={i}
                className="font-title font-bold text-7xl leading-tight"
                style={{ color: item.color ?? "rgba(255,255,255,0.55)" }}
              >
                {item.text}
              </p>
            ))}
          </motion.div>
        )}

        {/* 正在打字的行 */}
        {currentLine && (
          <p
            className="font-title font-bold text-7xl leading-tight"
            style={{
              color: currentLine.color ?? "#ffffff",
              minHeight: "1.15em",
            }}
          >
            {displayText}
            <span
              className="inline-block w-0.75 h-[0.8em] align-middle ml-1"
              style={{
                background: currentLine.color ?? "white",
                animation: "pulse 0.9s ease-in-out infinite",
                opacity: 0.9,
              }}
            />
          </p>
        )}

        <AnimatePresence>
          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-6 flex items-center justify-end"
            >
              <ActionButton text="開始遊戲" href="/chapter00" variant="gold" />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <div className="flex-62" />
    </div>
  );
}
