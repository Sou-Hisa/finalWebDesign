"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/store";
import ItemBar from "../../component/ItemBar";
import Modal from "../../component/Modal";
import ActionButton from "../../component/ActionButton"; // Modal 內仍使用

const ZONES = [
  { key: "note",  label: "左側牆壁", href: "/explore/cipher", cls: "left-0 w-[20%]"   },
  { key: "bones", label: "正面牆壁", href: "/explore/bones",  cls: "left-[20%] w-[60%]" },
  { key: "wand",  label: "右側牆壁", href: "/explore/wand",   cls: "right-0 w-[20%]"  },
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
      <div className="flex-1 relative bg-black">
        {/* 背景 */}
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
        <div className="absolute inset-0 bg-black/55" />

        {/* 三個大互動區域 */}
        {ZONES.map((zone) => {
          const done = collected(zone.key);
          return (
            <div
              key={zone.key}
              onClick={() => router.push(zone.href)}
              className={`absolute top-0 h-full ${zone.cls} cursor-pointer group
                flex items-center justify-center
                border-2 transition-all duration-200
                ${done
                  ? "border-green-600/50 bg-green-900/20"
                  : "border-transparent hover:border-amber-400/50 hover:bg-amber-400/8"
                }`}
            >
              <span className={`font-ui text-sm tracking-widest transition-opacity duration-200
                ${done
                  ? "opacity-60 text-green-400"
                  : "opacity-0 group-hover:opacity-100 text-amber-200"
                }`}>
                {done ? "已調查" : zone.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 底部提示 */}
      <div className="px-6 py-4 border-t border-stone-700 text-xs font-ui text-gray-300 text-right">
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
          <div className="flex justify-center">
            <ActionButton
              onClick={() => { setRecipeFound(); router.push("/chapter02"); }}
              className="border-2 border-red-600 px-8 py-2 font-bold text-red-700 hover:bg-red-600 hover:text-white transition-colors"
            >
              繼續
            </ActionButton>
          </div>
        </Modal>
      )}
    </div>
  );
}
