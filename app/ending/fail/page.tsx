"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ActionButton from "../../../component/ActionButton";

const LINES = [
  "你們的動作慢了一步，女巫強大的黑魔法將你們牢牢困住。",
  "「嘿嘿，多麼鮮嫩的肉啊……」",
  "幾天後，糖果屋的角落裡，又多出了兩副小小的白骨。",
  "屋子依舊散發著甜美的香氣，靜靜地等待著下一批迷路的獵物……",
];

const ITALIC_LINES = new Set([1, 3]);
const DIM_LINES    = new Set([3]);

const CHAR_DELAY = 46;
const LINE_PAUSE = 750;

export default function EndingFail() {
  const router = useRouter();

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

  function handleRestart() { router.push("/battle"); }

  const currentTyping = lineIdx < LINES.length ? LINES[lineIdx].slice(0, charIdx) : null;

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-950 gap-6 px-8">

      <div className="w-full max-w-lg flex flex-col gap-3 font-body text-lg leading-relaxed min-h-48">
        {doneLines.map((line, i) => (
          <p
            key={i}
            className={ITALIC_LINES.has(i) ? "italic" : ""}
            style={{
              color: DIM_LINES.has(i)
                ? "#78716c"
                : ITALIC_LINES.has(i)
                ? "#86efac"
                : "#d6d3d1",
            }}
          >
            {line}
          </p>
        ))}

        {currentTyping !== null && (
          <p
            className={ITALIC_LINES.has(lineIdx) ? "italic" : ""}
            style={{
              color: DIM_LINES.has(lineIdx)
                ? "#78716c"
                : ITALIC_LINES.has(lineIdx)
                ? "#86efac"
                : "#d6d3d1",
            }}
          >
            {currentTyping}
            <span className="animate-pulse text-red-500">|</span>
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
            {/* 結果圖佔位（換圖時把 div 換成 <img src="/images/ending-fail.png" ... />） */}
            <div
              className="w-64 h-40 border-2 flex items-center justify-center text-xs font-ui text-red-400"
              style={{ borderColor: "#991b1b", background: "rgba(60,10,10,0.3)" }}
            >
              [死亡結局 結果圖]
            </div>

            <ActionButton
              onClick={handleRestart}
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
