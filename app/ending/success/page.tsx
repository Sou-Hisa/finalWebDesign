"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "../../../store/store";

export default function EndingSuccess() {
  const router = useRouter();
  const resetGame = useGameStore((s) => s.resetGame);

  function handleRestart() {
    resetGame();
    router.push("/");
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-amber-50 gap-8 px-8 text-center relative overflow-hidden">
      {/* 裝飾背景 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none">
        <span className="text-[20rem]">🌅</span>
      </div>

      {/* 火焰動畫 */}
      <div className="flex gap-3 text-4xl animate-bounce">
        <span>🔥</span><span>💀</span><span>🔥</span>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg">
        <h1 className="text-3xl font-black text-amber-800">【燒烤巫婆大作戰：成功！】</h1>

        <div className="text-5xl">🎉</div>

        <p className="text-base text-stone-700 leading-relaxed">
          趁著女巫靠近火爐，你們用盡全力將她推了進去！
        </p>
        <p className="text-lg font-bold text-red-700 italic">
          「啊——！」
        </p>
        <p className="text-base text-stone-700 leading-relaxed">
          女巫慘叫著跌入熊熊烈火中，化為灰燼。
        </p>
        <p className="text-base text-stone-700 leading-relaxed">
          危機解除了！你們在屋子深處發現了女巫藏匿的金銀珠寶。帶著這些寶藏，你們牽著手逃出糖果屋，循著晨光終於找到了回家的路。
        </p>
        <p className="text-base font-semibold text-amber-700">
          從此，一家人過著不再挨餓的幸福日子。
        </p>

        <div className="flex gap-4 text-4xl mt-2">
          <span>👧</span><span>👦</span><span>💎</span><span>🏠</span>
        </div>

        <button
          onClick={handleRestart}
          className="mt-4 border-2 border-amber-700 px-10 py-3 font-bold text-amber-800 hover:bg-amber-700 hover:text-white transition-colors text-lg"
        >
          再玩一次
        </button>
      </div>
    </div>
  );
}
