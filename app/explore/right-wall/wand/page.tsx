"use client";

import { useRouter } from "next/navigation";
import Img from "next/image";
import { useGameStore } from "../../../../store/store";
import ActionButton from "../../../../component/ActionButton";

export default function RightWallWand() {
  const router = useRouter();
  const { addItem, collectedItems } = useGameStore();
  const alreadyCollected = collectedItems.includes("magicwand");

  function handleCollect() {
    addItem("magicwand");
    router.push("/explore/right-wall");
  }

  if (alreadyCollected) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-stone-900 gap-4">
        <div className="w-12 h-28 bg-stone-800/60 border-2 border-dashed border-stone-700 flex items-center justify-center text-stone-600 text-xs font-ui rounded">
          🪄
        </div>
        <p className="text-stone-500 text-sm font-ui">魔仗已蒐集</p>
        <ActionButton href="/explore/right-wall" variant="ghost" className="mt-2 px-6 py-2 font-ui text-stone-400 border border-stone-700">
          返回
        </ActionButton>
      </div>
    );
  }

  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-center gap-5 bg-black overflow-hidden">
      <Img
        src="/images/explore_right1.png"
        alt="right_wall"
        width={1920}
        height={1080}
        className="absolute inset-0 w-full h-full object-cover object-bottom pointer-events-none opacity-35 blur-xs"
      />

      <div className="relative z-10 w-full mx-8 max-w-2xl rounded-xl p-10 bg-stone-950/92 border border-amber-900/50 shadow-[0_0_60px_rgba(0,0,0,0.95)] flex flex-col gap-6">
        <div className="relative w-full h-64 bg-black/50 rounded-lg border border-amber-900/30 flex items-center justify-center overflow-hidden">
          <Img
            src="/item_images/wand.png"
            alt="魔仗"
            width={160}
            height={160}
            className="object-contain rotate-290 drop-shadow-[0_0_24px_rgba(251,191,36,0.5)]"
          />
        </div>

        <p className="text-stone-300 text-base font-body leading-relaxed">
          牆角放著一根細長的木製魔仗，上面刻有奇怪的紋路，散發著微弱的光芒。不知道能用來對付什麼……
        </p>

        <div className="flex justify-center gap-6">
          <ActionButton onClick={handleCollect} variant="gold">
            蒐集
          </ActionButton>
          <ActionButton href="/explore/right-wall" variant="ghost">
            離開
          </ActionButton>
        </div>
      </div>
    </div>
  );
}