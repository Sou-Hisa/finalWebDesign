"use client";

import { motion, AnimatePresence } from "framer-motion";

// 依角色動態換邊框色
const characterColor: Record<string, string> = {
  "葛麗特":     "#c25d7e", 
  "漢賽爾":     "#4a7ca3",
  "慈祥的老婆婆": "#c9823b",
  "老奶奶":     "#c9823b",
  "女巫":       "#6b5494",
  "巫婆（老奶奶）": "#6b5494"
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
    <div className="mx-auto my-4 flex flex-col gap-2 z-10 absolute bottom-0 left-1/2 -translate-x-1/2 w-[95%]" style={{ ['--accent' as any]: color }}>
      {/* 角色名稱 + 繼續按鈕 */}
      <div className="flex items-center justify-between">
        <motion.div
          key={character}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
            className={
              `flex items-center justify-center px-4 py-2 text-center text-sm font-semibold font-title bg-white/80 rounded-md`
            }
          style={{ color }}
        >
          {character}
        </motion.div>

        <button onClick={onNext} className="flex items-center justify-center px-4 py-2 text-sm text-white font-title font-semibold rounded-md border border-white/80 hover:bg-black/30 transition-all duration-200">
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
            className="px-5 py-4 text-base font-body bg-white/80 text-black rounded-md"
        >
          {text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
