"use client";

import { motion } from "framer-motion";

const ITEM_CONFIG: Record<string, { label: string; emoji: string }> = {
  box:      { label: "舊箱子", emoji: "📦" },
  bones:    { label: "白色骨頭", emoji: "🦴" },
  wand:     { label: "密碼表",   emoji: "📜" },
  magicwand:{ label: "魔仗",     emoji: "🪄" },
};

interface ItemBarProps {
  collectedItems: string[];
  onItemClick?: (key: string) => void;
}

export default function ItemBar({ collectedItems, onItemClick }: ItemBarProps) {
  return (
    <div className="w-full px-4 py-2 flex items-center">
      <p className="text-sm font-ui mr-4" style={{ color: "#ccc" }}>
        物品收集欄
      </p>

      <div className="flex gap-2">
        {Object.entries(ITEM_CONFIG).map(([key, { label, emoji }]) => {
          const collected = collectedItems.includes(key);
          const clickable = collected && !!onItemClick;

          return (
            <motion.button
              key={key}
              type="button"
              title={collected ? `${label}（點擊查看）` : label}
              animate={collected ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.35 }}
              onClick={() => clickable && onItemClick(key)}
              className={`flex flex-col items-center px-4 py-1 border rounded-lg text-xs transition-all relative overflow-hidden
                ${clickable ? "cursor-pointer hover:brightness-125 active:scale-95" : "cursor-default"}`}
              style={{
                borderColor: collected ? "var(--color-gold)" : "#44332211",
                background:  collected ? "rgba(245,166,35,0.12)" : "rgba(255,255,255,0.03)",
                color:        collected ? "#f5a623" : "#55443322",
                filter:       collected ? "none" : "grayscale(1) opacity(0.3)",
                boxShadow:    collected ? "0 0 8px #f5a62333" : "none",
              }}
            >
              {collected && (
                <span
                  className="absolute inset-0 shimmer pointer-events-none"
                  style={{ mixBlendMode: "overlay" }}
                />
              )}
              <span className="text-sm relative z-10">{emoji}</span>
              <span className="font-ui relative z-10">{label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
