"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameStore } from "../../../store/store";

const lines = [
  "你們的動作慢了一步，女巫強大的黑魔法將你們牢牢困住。",
  "「嘿嘿，多麼鮮嫩的肉啊……」",
  "幾天後，糖果屋的角落裡，又多出了兩副小小的白骨。",
  "屋子依舊散發著甜美的香氣，靜靜地等待著下一批迷路的獵物……",
];

export default function EndingFail() {
  const router    = useRouter();
  const resetGame = useGameStore((s) => s.resetGame);
  function handleRestart() { resetGame(); router.push("/"); }

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 text-center gap-6"
      style={{ background: "radial-gradient(ellipse at 50% 50%, #1a0505 0%, #0d0705 100%)" }}
    >
      {/* 微光骨頭裝飾 */}
      {[...Array(6)].map((_, i) => (
        <motion.span key={i}
          className="absolute text-2xl pointer-events-none select-none opacity-10"
          style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ opacity: [0.05, 0.2, 0.05], rotate: [0, 10, -5, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
        >
          🦴
        </motion.span>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-5 max-w-lg">
        <motion.h1
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-title" style={{ color: "#ef4444", textShadow: "0 0 20px #ef444499" }}
        >
          逃脫失敗：成為晚餐
        </motion.h1>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex gap-3 text-4xl">
          <span>🦴</span><span>💀</span><span>🦴</span>
        </motion.div>

        <div className="flex flex-col gap-3">
          {lines.map((line, i) => (
            <motion.p key={i}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.35 }}
              className="font-body text-sm leading-relaxed"
              style={{
                color: line.startsWith("「") ? "#4ade80"
                     : i === lines.length - 1  ? "#6b7280"
                     : "#c4b59a",
                fontStyle: line.startsWith("「") || i === lines.length - 1 ? "italic" : "normal",
              }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleRestart}
          className="mt-4 border-2 px-10 py-3 font-ui font-bold tracking-wider transition-all duration-300"
          style={{ borderColor: "#ef4444", color: "#ef4444", background: "rgba(239,68,68,0.1)",
                   boxShadow: "0 0 8px #ef444433" }}
        >
          再試一次
        </motion.button>
      </div>
    </div>
  );
}
