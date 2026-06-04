"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/store";
import ItemBar from "../../component/ItemBar";
import Modal from "../../component/Modal";

export default function Explore() {
  const router = useRouter();
  const { collectedItems } = useGameStore();
  const [showRecipe, setShowRecipe] = useState(false);

  const collected = (key: string) => collectedItems.includes(key);
  const allCollected = ["note", "bones", "wand"].every(collected);

  useEffect(() => {
    if (allCollected) {
      const t = setTimeout(() => setShowRecipe(true), 400);
      return () => clearTimeout(t);
    }
  }, [allCollected]);

  return (
    <div className="w-full h-screen flex flex-col bg-stone-950">
      {/* 頂部物品欄 */}
      <ItemBar collectedItems={collectedItems} />

      {/* 主場景：三面牆透視房間 */}
      <div className="flex-1 relative overflow-hidden">

        {/* ── 天花板 ── */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(0% 0%, 100% 0%, 72% 12%, 28% 12%)",
            background: "linear-gradient(to bottom, #1a0a02, #2d1505)",
          }}
        />

        {/* ── 左牆 ── */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(0% 0%, 28% 12%, 28% 72%, 0% 100%)",
            background: "linear-gradient(to right, #1c0e04, #3d2010)",
          }}
        />

        {/* ── 右牆 ── */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(72% 12%, 100% 0%, 100% 100%, 72% 72%)",
            background: "linear-gradient(to left, #1c0e04, #3d2010)",
          }}
        />

        {/* ── 後牆 ── */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(28% 12%, 72% 12%, 72% 72%, 28% 72%)",
            background: "linear-gradient(to bottom, #4a2510, #2e160a)",
          }}
        />

        {/* ── 地板 ── */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: "polygon(0% 100%, 28% 72%, 72% 72%, 100% 100%)",
            background: "linear-gradient(to bottom, #3b1e08, #1a0b03)",
          }}
        />

        {/* ── 後牆裝飾線框（加深邊界感） ── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ zIndex: 1 }}
        >
          <polygon
            points="28,12 72,12 72,72 28,72"
            fill="none"
            stroke="#6b3a1a"
            strokeWidth="0.4"
            vectorEffect="non-scaling-stroke"
          />
          <line x1="0" y1="100" x2="28" y2="72" stroke="#5c2e0e" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
          <line x1="72" y1="72" x2="100" y2="100" stroke="#5c2e0e" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* ════════════════════════════════
            三個互動物件
            使用 % 定位，對應透視座標
            ════════════════════════════════ */}

        {/* 1. 密碼紙條 ── 後牆左側（掛在牆上） */}
        <ItemSpot
          collected={collected("note")}
          label="密碼紙條"
          emoji="📜"
          onClick={() => router.push("/explore/cipher")}
          style={{ left: "34%", top: "22%", transform: "translate(-50%,-50%)" }}
          glowColor="amber"
        />

        {/* 2. 舊箱子 ── 地板中央 */}
        <ItemSpot
          collected={collected("bones")}
          label="舊箱子"
          emoji="📦"
          onClick={() => router.push("/explore/bones")}
          style={{ left: "50%", top: "77%", transform: "translate(-50%,-50%)" }}
          glowColor="stone"
        />

        {/* 3. 神秘木棍 ── 右牆靠近角落 */}
        <ItemSpot
          collected={collected("wand")}
          label="神秘木棍"
          emoji="🪄"
          onClick={() => router.push("/explore/wand")}
          style={{ left: "80%", top: "42%", transform: "translate(-50%,-50%)" }}
          glowColor="purple"
        />

        {/* 底部提示文字 */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-stone-500 text-xs select-none pointer-events-none">
          {allCollected
            ? "牆壁上有什麼東西……"
            : `尚有 ${3 - ["note","bones","wand"].filter(collected).length} 個線索未找到`}
        </div>
      </div>

      {/* 食譜發現彈窗 */}
      {showRecipe && (
        <Modal title="💀 牆壁暗格彈開了！">
          <p className="text-sm leading-relaxed mb-2">
            結合了求救紙條、骨頭證據和魔杖，牆壁上的暗格突然彈開——掉出了一本書。
          </p>
          <p className="text-center text-xl font-bold text-red-700 my-3">《小孩食譜》</p>
          <p className="text-sm italic text-red-600 text-center mb-4">
            「如何烤出鮮嫩多汁的小女孩與小男孩……」
          </p>
          <button
            onClick={() => router.push("/chapter02")}
            className="w-full border-2 border-red-600 py-2 font-bold text-red-700 hover:bg-red-600 hover:text-white transition-colors"
          >
            繼續 →
          </button>
        </Modal>
      )}
    </div>
  );
}

// ── 互動物件元件 ──────────────────────────────────────────
interface ItemSpotProps {
  collected: boolean;
  label: string;
  emoji: string;
  onClick: () => void;
  style: React.CSSProperties;
  glowColor: "amber" | "stone" | "purple";
}

const glowMap = {
  amber:  { border: "#f59e0b", bg: "rgba(120,60,0,0.5)",  text: "#fcd34d" },
  stone:  { border: "#78716c", bg: "rgba(40,25,10,0.5)",  text: "#d6d3d1" },
  purple: { border: "#a855f7", bg: "rgba(60,10,80,0.5)",  text: "#d8b4fe" },
};

function ItemSpot({ collected, label, emoji, onClick, style, glowColor }: ItemSpotProps) {
  const { border, bg, text } = glowMap[glowColor];
  return (
    <button
      onClick={onClick}
      className="absolute flex flex-col items-center gap-1 group transition-transform hover:scale-110 active:scale-95"
      style={{ ...style, zIndex: 10 }}
    >
      <div
        className="w-14 h-14 rounded-lg flex items-center justify-center shadow-lg transition-all"
        style={{
          border: `2px solid ${collected ? "#22c55e" : border}`,
          background: collected ? "rgba(20,80,30,0.6)" : bg,
          boxShadow: collected
            ? "0 0 12px #22c55e66"
            : `0 0 14px ${border}66`,
          animation: collected ? "none" : "subtle-pulse 2s ease-in-out infinite",
        }}
      >
        <span className="text-3xl">{emoji}</span>
      </div>
      <span
        className="text-xs font-medium px-1.5 py-0.5 rounded"
        style={{
          color: collected ? "#86efac" : text,
          background: "rgba(0,0,0,0.5)",
        }}
      >
        {collected ? `✓ ${label}` : label}
      </span>

      <style>{`
        @keyframes subtle-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }
      `}</style>
    </button>
  );
}
