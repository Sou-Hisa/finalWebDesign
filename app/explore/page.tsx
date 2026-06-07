"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../store/store";
import ItemBar from "../../component/ItemBar";
import Modal from "../../component/Modal";
import ActionButton from "../../component/ActionButton";
import Img from "next/image";

// dots: 相對於該 zone 寬度的 % 位置
const ZONES = [
  { label: "左側牆壁", href: "/explore/left-wall",   w: "20%", left: "0%",
    dots: [{ x: "38%", y: "74%" }],   // 地板箱子位置
    isDone: (c: (k: string) => boolean) => c("box") },
  { label: "中間牆壁", href: "/explore/center-wall", w: "60%", left: "20%",
    dots: [{ x: "36%", y: "22%" }, { x: "58%", y: "52%" }],  // 書架上方書叢、中層食譜
    isDone: (c: (k: string) => boolean) => c("bones") && c("note") && c("puzzle") },
  { label: "右側牆壁", href: "/explore/right-wall",  w: "20%", left: "80%",
    dots: [{ x: "42%", y: "33%" }, { x: "55%", y: "76%" }],  // 牆上畫框、地板魔仗
    isDone: (c: (k: string) => boolean) => c("wand") && c("magicwand") },
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
    <div className="w-full h-screen flex flex-col relative overflow-hidden">
      {/* 頂部物品欄 — 收集到的物品可點擊查看 */}
      <ItemBar collectedItems={collectedItems} onItemClick={setViewingItem}/>

      {/* 主場景：全景底圖 + 三個互動熱區 */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <Img
          src="/images/explore_bg1.png"
          alt="糖果屋內部"
          fill
          priority
          className="object-cover object-center opacity-80"
        />

        {/* 三個互動熱區，覆蓋在底圖上 */}
        {ZONES.map((zone) => {
          const done = zone.isDone(collected);
          return (
            <div
              key={zone.href}
              onClick={() => !done ? router.push(zone.href) : router.push(zone.href)}
              className="absolute top-0 h-full cursor-pointer group"
              style={{ width: zone.w, left: zone.left }}
            >
              {/* hover 時整區亮度提升 */}
              <div className={`absolute inset-0 transition-all duration-300
                ${done
                  ? "bg-black/30"
                  : "bg-transparent group-hover:bg-amber-300/8"}`}
              />

              {/* 未探索：精準定位在底圖物件上的脈衝光點 */}
              {!done && zone.dots.map((dot, di) => (
                <div
                  key={di}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ left: dot.x, top: dot.y }}
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-55" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-200 opacity-85" />
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* 底部提示 */}
      {(() => {
        const collectedCount = ["box","bones","wand","note","magicwand","puzzle"].filter(k => collected(k)).length;
        const hints = ["這裡一定還藏著什麼……", "再仔細找找。", "線索越來越清晰了……", "所有線索已收集完畢……"];
        const hint  = allCollected ? hints[3] : hints[Math.floor((collectedCount / 6) * (hints.length - 1))];
        return (
          <div className="px-6 py-4 text-xs font-ui text-stone-400 text-right italic">{hint}</div>
        );
      })()}

      {/* 物品詳情 Modal */}
      {viewingItem && ITEM_DETAIL[viewingItem] && (() => {
        const detail = ITEM_DETAIL[viewingItem];
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 rounded-lg p-8 backdrop-blur-md bg-white/20 border border-white/30 shadow-2xl flex flex-col gap-4">
              <div className="w-full h-44 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-stone-300 text-xs font-ui">
                {detail.imgLabel}
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-amber-300 text-sm font-title font-bold">{detail.title}</p>
                <p className="text-stone-200 text-sm font-body leading-relaxed">{detail.desc}</p>
              </div>
              <div className="flex justify-center">
                <ActionButton
                  onClick={() => setViewingItem(null)}
                  variant="white"
                  className="px-8"
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
        <Modal title="牆壁的暗格彈開了">
          <p className="text-sm leading-relaxed mb-3 text-stone-300">
            所有線索拼湊在一起——牆壁深處的暗格，突然彈開了。
          </p>
          <p className="text-center text-xl font-bold font-title my-4" style={{ color: "#ef4444" }}>
            《小孩食譜》
          </p>
          <p className="text-sm italic text-red-400 text-center mb-5">
            「如何烤出鮮嫩多汁的小女孩與小男孩……」
          </p>
          <div className="flex justify-center">
            <ActionButton
              onClick={() => { setRecipeFound(); router.push("/chapter02"); }}
              variant="white"
              className="px-8 py-2 font-bold"
            >
              繼續
            </ActionButton>
          </div>
        </Modal>
      )}
    </div>
  );
}
