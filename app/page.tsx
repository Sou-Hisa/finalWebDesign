"use client";

import { motion } from "framer-motion";
import ActionButton from "../component/ActionButton";

const STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 2,
}));

export default function Home() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden vignette candy-stripes">

      {/* 飄動星星 */}
      {STARS.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${s.x}%`,
            top:  `${s.y}%`,
            width:  s.size,
            height: s.size,
            background: "#f5a623",
            boxShadow: `0 0 ${s.size * 2}px #f5a623`,
          }}
          animate={{ opacity: [0.1, 0.9, 0.1], scale: [0.8, 1.3, 0.8] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* 主內容 */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* 裝飾糖果 */}
        <motion.div
          className="flex gap-4 text-3xl select-none"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span>🍭</span><span>🏚️</span><span>🍬</span>
        </motion.div>

        {/* 標題 */}
        <h1
          className="font-title text-6xl text-glow-gold tracking-widest"
          style={{ color: "var(--color-gold)" }}
        >
          糖果屋
        </h1>

        <p className="font-ui text-sm tracking-[0.3em] text-stone-400 uppercase">
          Escape the Candy House
        </p>

        <div className="h-px w-48 bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-50" />

        <div className="flex flex-col items-center gap-2 text-stone-500 text-sm font-ui">
          <p>遊戲時間｜15 分鐘</p>
          <p>開發團隊｜宋書緹 周湧秝 馮妍嘉 陳柏硯 王浩川</p>
        </div>

        <ActionButton text="開始遊戲" href="/description" variant="gold" />
      </motion.div>
    </div>
  );
}
