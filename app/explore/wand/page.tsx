"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "../../../store/store";

export default function ExploreWand() {
  const router = useRouter();
  const { addItem, collectedItems } = useGameStore();
  const alreadyCollected = collectedItems.includes("wand");
  const [collected, setCollected] = useState(alreadyCollected);

  function handleCollect() {
    addItem("wand");
    setCollected(true);
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-purple-950 px-6 gap-6 relative">
      {/* 返回 */}
      <button
        onClick={() => router.push("/explore")}
        className="absolute top-4 left-4 text-purple-300 text-sm border border-purple-800 px-3 py-1 hover:bg-purple-900 transition-colors"
      >
        ← 返回
      </button>

      {/* 魔杖視覺 */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={`text-8xl transition-all duration-700 ${
            collected ? "drop-shadow-[0_0_20px_#a855f7]" : "animate-pulse drop-shadow-[0_0_10px_#7c3aed]"
          }`}
        >
          🪄
        </div>
        {!collected && (
          <div className="flex gap-1">
            {["✦","✧","✦","✧","✦"].map((s, i) => (
              <span key={i} className="text-purple-400 text-xs animate-ping" style={{ animationDelay: `${i * 0.15}s` }}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {!collected ? (
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <p className="text-purple-100 text-base leading-relaxed">
            廚房角落有一根木棍，散發著幽暗的光芒。
          </p>
          <p className="text-purple-200 text-sm leading-relaxed bg-purple-900/50 border border-purple-700 rounded p-3">
            這根木棍握起來有一股冰冷的力量，上面還刻著詭異的圖騰。
            <br /><br />
            這絕對不是普通的拐杖，比較像是傳說中的
            <span className="text-purple-300 font-bold">「黑魔法魔杖」</span>！
          </p>
          <button
            onClick={handleCollect}
            className="border-2 border-purple-500 px-8 py-2 text-purple-300 font-bold hover:bg-purple-700 hover:text-white transition-colors"
          >
            拿起魔杖
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <p className="text-green-400 font-bold text-base">✅ 巫婆魔杖已收集</p>
          <p className="text-purple-300 text-sm">魔杖在手中微微顫動，彷彿在等待釋放……</p>
          <button
            onClick={() => router.push("/explore")}
            className="border-2 border-green-700 px-8 py-2 text-green-400 font-bold hover:bg-green-900 transition-colors"
          >
            返回場景
          </button>
        </div>
      )}
    </div>
  );
}
