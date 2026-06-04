"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "../../../store/store";

export default function EndingFail() {
  const router    = useRouter();
  const resetGame = useGameStore((s) => s.resetGame);

  function handleRestart() { resetGame(); router.push("/"); }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-950 gap-6 px-8 text-center">
      <h1 className="text-3xl font-title text-red-400">
        逃脫失敗：成為晚餐
      </h1>

      <div className="h-px w-48 bg-stone-700" />

      <div className="max-w-lg flex flex-col gap-3 font-body text-sm leading-relaxed">
        <p className="text-stone-300">你們的動作慢了一步，女巫強大的黑魔法將你們牢牢困住。</p>
        <p className="text-green-400 italic">「嘿嘿，多麼鮮嫩的肉啊……」</p>
        <p className="text-stone-300">幾天後，糖果屋的角落裡，又多出了兩副小小的白骨。</p>
        <p className="text-stone-500 italic">屋子依舊散發著甜美的香氣，靜靜地等待著下一批迷路的獵物……</p>
      </div>

      <button
        onClick={handleRestart}
        className="border-2 border-red-600 px-10 py-3 font-ui font-bold tracking-wider text-red-400 hover:bg-red-900 transition-colors"
      >
        再試一次
      </button>
    </div>
  );
}
