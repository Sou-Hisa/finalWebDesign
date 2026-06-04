"use client";

import { motion, AnimatePresence } from "framer-motion";

// 依角色動態換邊框色
const characterColor: Record<string, string> = {
  "葛麗特":     "#e91e8c",
  "漢賽爾":     "#60a5fa",
  "慈祥的老婆婆": "#f5a623",
  "老奶奶":     "#f5a623",
  "女巫":       "#8b5cf6",
  "巫婆（老奶奶）": "#8b5cf6",
};

function getColor(character: string) {
  return characterColor[character] ?? "#f5a623";
}

interface DialogueBoxProps {
  character: string;
  text: string;
  onNext: () => void;
  isLast: boolean;
  nextLabel?: string;
  lastLabel?: string;
}

export default function DialogueBox({
  character,
  text,
  onNext,
  isLast,
  nextLabel = "繼續",
  lastLabel = "繼續",
}: DialogueBoxProps) {
  const color = getColor(character);

  return (
    <div className="mx-4 mb-4 flex flex-col gap-2">
      {/* 角色名稱 + 繼續按鈕 */}
      <div className="flex items-end justify-between gap-4">
        <motion.div
          key={character}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="min-w-28 px-4 py-1.5 text-center text-sm font-ui font-semibold border-2"
          style={{
            borderColor: color,
            color: color,
            background: "rgba(0,0,0,0.6)",
            boxShadow: `0 0 8px ${color}44`,
          }}
        >
          {character}
        </motion.div>

        <button
          onClick={onNext}
          className="border-2 px-5 py-1.5 text-sm font-ui font-medium tracking-wider transition-all duration-300 hover:brightness-125"
          style={{
            borderColor: color,
            color: color,
            background: "rgba(0,0,0,0.5)",
          }}
        >
          {isLast ? lastLabel : nextLabel}
        </button>
      </div>

      {/* 對話文字框 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.28 }}
          className="min-h-16 px-5 py-4 text-base font-body border-2 leading-relaxed"
          style={{
            borderColor: `${color}66`,
            background: "rgba(0,0,0,0.65)",
            color: "#f0e0c0",
            backdropFilter: "blur(4px)",
          }}
        >
          {text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
