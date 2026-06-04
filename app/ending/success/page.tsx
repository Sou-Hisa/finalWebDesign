"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGameStore } from "../../../store/store";

const lines = [
  "趁著女巫靠近火爐，你們用盡全力將她推了進去！",
  "「啊——！」",
  "女巫慘叫著跌入熊熊烈火中，化為灰燼。",
  "危機解除了！你們在屋子深處發現了女巫藏匿的金銀珠寶。",
  "帶著這些寶藏，你們牽著手逃出糖果屋，循著晨光終於找到了回家的路。",
  "從此，一家人過著不再挨餓的幸福日子。",
];

export default function EndingSuccess() {
  const router  = useRouter();
  const resetGame = useGameStore((s) => s.resetGame);

  function handleRestart() { resetGame(); router.push("/"); }

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 text-center gap-6"
      style={{
        background: "conic-gradient(from 180deg at 50% 120%, #b45309 0deg, #f59e0b 60deg, #fde68a 90deg, #f59e0b 120deg, #b45309 180deg, #0d0705 260deg, #0d0705 360deg)",
      }}
    >
      {/* 放射光暈蓋層 */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(0,0,0,0.82) 100%)" }} />

      <div className="relative z-10 flex flex-col items-center gap-5 max-w-lg">
        <motion.h1
          initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-3xl font-title text-glow-gold" style={{ color: "#f5a623" }}
        >
          燒烤巫婆大作戰：成功！
        </motion.h1>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex gap-3 text-4xl">
          <span>🔥</span><span>💀</span><span>🔥</span>
        </motion.div>

        <div className="flex flex-col gap-2.5">
          {lines.map((line, i) => (
            <motion.p key={i}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.25 }}
              className="font-body text-sm leading-relaxed"
              style={{ color: line === "「啊——！」" ? "#f87171" : "#e8d5b0",
                       fontStyle: line === "「啊——！」" ? "italic" : "normal",
                       fontWeight: line.startsWith("從此") ? "600" : "400" }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          className="flex gap-4 text-3xl mt-2">
          <span>👧</span><span>👦</span><span>💎</span><span>🏠</span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.9 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleRestart}
          className="mt-2 border-2 px-10 py-3 font-ui font-bold tracking-wider transition-all duration-300 border-glow-gold hover:brightness-125"
          style={{ borderColor: "#f5a623", color: "#f5a623", background: "rgba(245,166,35,0.1)" }}
        >
          再玩一次
        </motion.button>
      </div>
    </div>
  );
}
