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
    <div className="mx-6 my-4 flex flex-col gap-4" style={{ ['--accent' as any]: color }}>
      {/* 角色名稱 + 繼續按鈕 */}
      <div className="flex items-center justify-between">
        <motion.div
          key={character}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
            className={
              `flex items-center justify-center px-4 py-2 text-center text-sm font-semibold font-title bg-white`
            }
          style={{ color }}
        >
          {character}
        </motion.div>

        <button onClick={onNext} className="flex items-center justify-center px-4 py-2 text-sm text-white font-title font-semibold border border-white">
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
            className="px-5 py-4 text-base font-body bg-white text-black"
        >
          {text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
