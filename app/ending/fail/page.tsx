"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "../../../store/store";

export default function EndingFail() {
  const router = useRouter();
  const resetGame = useGameStore((s) => s.resetGame);

  function handleRestart() {
    resetGame();
    router.push("/");
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-950 gap-8 px-8 text-center relative overflow-hidden">
      {/* 裝飾背景 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
        <span className="text-[20rem]">💀</span>
      </div>

      {/* 骨頭 */}
      <div className="flex gap-3 text-4xl">
        <span>🦴</span><span>🦴</span><span>🦴</span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg">
        <h1 className="text-3xl font-black text-red-400">【逃脫失敗：成為晚餐】</h1>

        <div className="text-5xl">😱</div>

        <p className="text-base text-gray-300 leading-relaxed">
          你們的動作慢了一步，女巫強大的黑魔法將你們牢牢困住。
        </p>
        <p className="text-lg font-bold text-green-400 italic">
          「嘿嘿，多麼鮮嫩的肉啊……」
        </p>
        <p className="text-base text-gray-300 leading-relaxed">
          幾天後，糖果屋的角落裡，又多出了兩副小小的白骨。
        </p>
        <p className="text-base text-gray-500 leading-relaxed italic">
          屋子依舊散發著甜美的香氣，靜靜地等待著下一批迷路的獵物……
        </p>

        <div className="flex gap-4 text-4xl mt-2">
          <span>🦴</span><span>🦴</span><span>🏚️</span>
        </div>

        <button
          onClick={handleRestart}
          className="mt-4 border-2 border-red-600 px-10 py-3 font-bold text-red-400 hover:bg-red-700 hover:text-white transition-colors text-lg"
        >
          再試一次
        </button>
      </div>
    </div>
  );
}
