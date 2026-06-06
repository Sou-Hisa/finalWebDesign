"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/store";
import ItemBar from "../../component/ItemBar";
import Modal from "../../component/Modal";
import ActionButton from "../../component/ActionButton";
import Img from "next/image";

const ZONES = [
  { key: "box",   label: "左側牆壁", href: "/explore/left-wall",   cls: "left-0 w-[20%]"   },
  { key: "bones", label: "中間牆壁", href: "/explore/center-wall", cls: "left-[20%] w-[60%]" },
  { key: "wand",  label: "右側牆壁", href: "/explore/right-wall",  cls: "right-0 w-[20%]"  },
];

const ITEM_DETAIL: Record<string, { title: string; desc: string; imgLabel: string }> = {
  box: {
    title: "打開的舊箱子",
    desc:  "箱子裡裝滿了細長均勻的白色骨頭。四肢比例對稱，頭骨碎片偏圓，整體輕薄——這是人類小孩的骨骸。",
    imgLabel: "[箱子內容物圖片]",
  },
  bones: {
    title: "白色骨頭（人類幼童）",
    desc:  "與書架上《骨骼圖鑑》的人類幼童項目完全吻合。箱子裡的骨頭，確定是人類小孩的。",
    imgLabel: "[骨頭比對圖片]",
  },
  wand: {
    title: "密碼對照表",
    desc:  "一張印有字母與數字對照關係的紙片。A=1, B=2, C=3……可以用來解讀神秘紙條上的數字訊息。",
    imgLabel: "[密碼對照表圖片]",
  },
  magicwand: {
    title: "神秘的魔仗",
    desc:  "一根細長的木製魔仗，刻有奇怪的紋路，散發著微弱的光芒。不知道能用來對付什麼……",
    imgLabel: "[魔仗圖片]",
  },
};

export default function Explore() {
  const router = useRouter();
  const { collectedItems, recipeFound, setRecipeFound } = useGameStore();
  const [showRecipe,   setShowRecipe]   = useState(false);
  const [viewingItem,  setViewingItem]  = useState<string | null>(null);

  const collected = (key: string) => collectedItems.includes(key);
  const allCollected = ["box", "bones", "wand", "note", "magicwand", "puzzle"].every(collected);

  useEffect(() => {
    if (allCollected && !recipeFound) {
      const t = setTimeout(() => setShowRecipe(true), 400);
      return () => clearTimeout(t);
    }
  }, [allCollected, recipeFound]);

  return (
    <div className="w-full h-screen flex flex-col bg-black relative overflow-hidden">
      <div
        className="
          absolute inset-0
          bg-[url('/images/explore_bg1.png')]
          bg-cover
          bg-center
          bg-no-repeat
          opacity-60
        "
      />
      {/* 頂部物品欄 — 收集到的物品可點擊查看 */}
      <ItemBar collectedItems={collectedItems} onItemClick={setViewingItem}/>

      {/* 主場景 */}
      <div className="flex-1 relative bg-stone-950 overflow-hidden">
      <Img 
        src="/images/explore_bg1.png" 
        loading="eager"
        alt="糖果屋書架背景" 
        width={1920} height={1080}
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
      />
      {/*<div className="flex-1 relative bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#8f877f_0%,#5a524d_36%,#2a2421_74%,#171312_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[18%] bg-gradient-to-t from-[#231b17] to-transparent" />
        <div className="absolute inset-x-[6%] top-[10%] bottom-[12%] border border-white/10 bg-white/5 shadow-[inset_0_0_80px_rgba(0,0,0,0.32)]" />
        <div className="absolute inset-y-[12%] left-[6%] right-[6%] grid grid-cols-3 pointer-events-none">
          <div className="border-r border-white/10 bg-white/5" />
          <div className="border-r border-white/10 bg-white/10" />
          <div className="bg-white/5" />
        </div>
        <div className="absolute inset-0 bg-black/55" />*/}

        {/* 三個牆壁互動區域 */}
        {ZONES.map((zone) => {
          const done = collected(zone.key);
          return (
            <div
              key={zone.key}
              onClick={() => router.push(zone.href)}
              className={`absolute top-0 h-full ${zone.cls} cursor-pointer group
                flex items-center justify-center border transition-all duration-200
                ${done
                  ? "bg-white/10 border-white/10"
                  : "border-transparent hover:border-amber-400/50 hover:bg-amber-400/8"}`}
            >
              <span className={`font-ui text-sm tracking-widest transition-opacity duration-200
                ${done
                  ? "opacity-60 text-white"
                  : "opacity-0 group-hover:opacity-100 text-amber-200"}`}>
                {done ? "已調查" : zone.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 底部提示 */}
      <div className="px-6 py-4 text-xs font-ui text-gray-100 text-right">
        {allCollected
          ? "所有線索已收集完畢……"
          : `尚有 ${["box","bones","wand","note","magicwand","puzzle"].filter(k => !collected(k)).length} 個線索未找到`}
      </div>

      {/* 物品詳情 Modal */}
      {viewingItem && ITEM_DETAIL[viewingItem] && (() => {
        const detail = ITEM_DETAIL[viewingItem];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
            <div className="w-full max-w-sm mx-4 bg-white/10 rounded-lg overflow-hidden shadow-2xl">
              <div className="w-full h-44 bg-black/40 flex items-center justify-center text-stone-400 text-xs font-ui">
                {detail.imgLabel}
              </div>
              <div className="p-4 flex flex-col gap-2">
                <p className="text-gray-200 text-sm font-ui font-bold">{detail.title}</p>
                <p className="text-gray-300 text-xs font-body leading-relaxed">{detail.desc}</p>
              </div>
              <div className="px-4 pb-4 flex justify-center">
                <ActionButton
                  onClick={() => setViewingItem(null)}
                  variant="ghost"
                  className="px-8 py-2 text-gray-300! border-gray-300!"
                >
                  關閉
                </ActionButton>
              </div>
            </div>
          </div>
        );
      })()}

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
