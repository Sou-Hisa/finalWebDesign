"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/store";
import ItemBar from "../../component/ItemBar";
import Modal from "../../component/Modal";

const ITEMS = [
  { key: "note",  label: "密碼紙條", href: "/explore/cipher", pos: "left-[10%] bottom-[25%]" },
  { key: "bones", label: "舊箱子",   href: "/explore/bones",  pos: "left-[50%] bottom-[25%]" },
  { key: "wand",  label: "神秘木棍", href: "/explore/wand",   pos: "right-[10%] bottom-[25%]" },
];

export default function Explore() {
  const router = useRouter();
  const { collectedItems, recipeFound, setRecipeFound } = useGameStore();
  const [showRecipe, setShowRecipe] = useState(false);

  const collected = (key: string) => collectedItems.includes(key);
  const allCollected = ["note", "bones", "wand"].every(collected);

  useEffect(() => {
    if (allCollected && !recipeFound) {
      const t = setTimeout(() => setShowRecipe(true), 400);
      return () => clearTimeout(t);
    }
  }, [allCollected, recipeFound]);

  return (
    <div className="w-full h-screen flex flex-col bg-stone-900">
      {/* 頂部物品欄 */}
      <ItemBar collectedItems={collectedItems} />

      {/* 主場景 */}
      <div className="flex-1 relative">
        {/* 背景佔位 */}
        <div
          className="
            absolute inset-0
            bg-[url('/images/bg_explore.png')]
            bg-auto
            bg-center
            bg-no-repeat         
          "
          style={{
            backgroundSize: "auto 100%",
          }}
        />

        {/* 三個互動物件 */}
        {ITEMS.map((item) => {
          const done = collected(item.key);
          return (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className={`absolute flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95 ${item.pos}`}
            >
              <div
                className="w-20 h-20 flex items-center justify-center border-2 text-xs font-ui font-bold"
                style={{
                  background: done ? "#1a3a1a" : "#4a2e08",
                  borderColor: done ? "#22c55e" : "var(--color-gold)",
                  color: done ? "#86efac" : "#f5a623",
                }}
              >
                {done ? "✓ 已收集" : item.label}
              </div>
              <span className="text-[10px] font-ui" style={{ color: done ? "#86efac" : "#f5a623" }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 底部提示 */}
      <div className="px-6 py-4 border-t border-stone-700 text-xs font-ui text-gray-300">
        {allCollected
          ? "所有線索已收集完畢……"
          : `尚有 ${3 - ["note","bones","wand"].filter(collected).length} 個線索未找到`}
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
            onClick={() => { setRecipeFound(); router.push("/chapter02"); }}
            className="w-full border-2 border-red-600 py-2 font-bold text-red-700 hover:bg-red-600 hover:text-white transition-colors"
          >
            繼續 →
          </button>
        </Modal>
      )}
    </div>
  );
}
