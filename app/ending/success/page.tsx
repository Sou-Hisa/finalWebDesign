"use client";

import { useRouter } from "next/navigation";
import { useGameStore } from "../../../store/store";

export default function EndingSuccess() {
  const router    = useRouter();
  const resetGame = useGameStore((s) => s.resetGame);

  function handleRestart() { resetGame(); router.push("/"); }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-amber-950 gap-6 px-8 text-center">
      <h1 className="text-3xl font-title" style={{ color: "var(--color-gold)" }}>
        燒烤巫婆大作戰：成功！
      </h1>

      <div className="h-px w-48 bg-stone-600" />

      <div className="max-w-lg flex flex-col gap-3 font-body text-sm text-stone-200 leading-relaxed">
        <p>趁著女巫靠近火爐，你們用盡全力將她推了進去！</p>
        <p className="text-red-300 italic">「啊——！」</p>
        <p>女巫慘叫著跌入熊熊烈火中，化為灰燼。</p>
        <p>危機解除了！你們在屋子深處發現了女巫藏匿的金銀珠寶。</p>
        <p>帶著這些寶藏，你們牽著手逃出糖果屋，循著晨光終於找到了回家的路。</p>
        <p className="font-semibold" style={{ color: "var(--color-gold)" }}>
          從此，一家人過著不再挨餓的幸福日子。
        </p>
      </div>

      <button
        onClick={handleRestart}
        className="border-2 px-10 py-3 font-ui font-bold tracking-wider transition-all hover:brightness-125 border-glow-gold"
        style={{ borderColor: "var(--color-gold)", color: "var(--color-gold)" }}
      >
        再玩一次
      </button>
    </div>
  );
}
