"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

const ITALIC_LINES = new Set([1]); // 「啊——！」
const HIGHLIGHT_LINES = new Set([5]); // 最後一句

const CHAR_DELAY = 42;   // ms per character
const LINE_PAUSE = 700;  // ms between lines

export default function EndingSuccess() {
  const router    = useRouter();
  const resetGame = useGameStore((s) => s.resetGame);

  const [doneLines,  setDoneLines]  = useState<string[]>([]);
  const [lineIdx,    setLineIdx]    = useState(0);
  const [charIdx,    setCharIdx]    = useState(0);
  const [showImage,  setShowImage]  = useState(false);

  useEffect(() => {
    if (lineIdx >= LINES.length) {
      const t = setTimeout(() => setShowImage(true), 900);
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
    const t = setTimeout(() => setCharIdx((c) => c + 1), CHAR_DELAY);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx]);

  function handleRestart() { resetGame(); router.push("/"); }

  const currentTyping = lineIdx < LINES.length ? LINES[lineIdx].slice(0, charIdx) : null;

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-amber-950 gap-6 px-8">

      <div className="w-full max-w-lg flex flex-col gap-3 font-body text-lg leading-relaxed min-h-56">
        {doneLines.map((line, i) => (
          <p
            key={i}
            className={
              HIGHLIGHT_LINES.has(i)
                ? "font-semibold"
                : ITALIC_LINES.has(i)
                ? "italic"
                : ""
            }
            style={{
              color: HIGHLIGHT_LINES.has(i)
                ? "var(--color-gold)"
                : ITALIC_LINES.has(i)
                ? "#fca5a5"
                : "#e7e5e4",
            }}
          >
            {line}
          </p>
        ))}

        {currentTyping !== null && (
          <p
            className={
              ITALIC_LINES.has(lineIdx) ? "italic" : ""
            }
            style={{ color: ITALIC_LINES.has(lineIdx) ? "#fca5a5" : "#e7e5e4" }}
          >
            {currentTyping}
            <span className="animate-pulse text-amber-300">|</span>
          </p>
        )}
      </div>

      <AnimatePresence>
        {showImage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="flex flex-col items-center gap-5"
          >
            {/* 結果圖佔位（換圖時把 div 換成 <img src="/images/ending-success.png" ... />） */}
            <div
              className="w-64 h-40 border-2 flex items-center justify-center text-xs font-ui text-amber-400"
              style={{ borderColor: "var(--color-gold)", background: "rgba(120,80,10,0.2)" }}
            >
              [逃脫成功 結果圖]
            </div>

            <ActionButton
              onClick={handleRestart}
              variant="gold"
              className="px-10 py-3 font-ui font-bold tracking-wider hover:brightness-125"
            >
              再玩一次
            </ActionButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
