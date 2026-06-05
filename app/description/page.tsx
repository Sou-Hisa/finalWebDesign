"use client";

import dynamic from "next/dynamic";
import ActionButton from "../../component/ActionButton";

const Typewriter = dynamic(() => import("typewriter-effect"), { ssr: false });

function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-gray-600 text-gray-100 text-xs font-ui ${className}`}>
      {label}
    </div>
  );
}

export default function Description() {
  return (
    <div className="w-full h-screen bg-gray-800 flex">
      {/* 左：文字區 */}
      <div className="w-2/3 flex flex-col justify-center gap-8 px-12">
        <p className="font-title text-2xl" style={{ color: "var(--color-gold)" }}>前情提要</p>
        <div className="font-body text-gray-200 text-base leading-relaxed min-h-32">
          <Typewriter
            options={{
              strings: [
                "很久以前，兄妹漢賽爾與葛麗特因家境貧困，被繼母說服父親帶進森林裡遺棄。",
                "第一次，漢賽爾沿路撒下白石子，借著月光順利找到回家的路。",
                "第二次他改用麵包屑，卻被鳥兒吃光，兄妹倆從此迷失在森林深處。",
                "就在飢寒交迫、幾乎絕望之際，他們發現了一棟神奇的房子……",
              ],
              autoStart: true,
              loop: true,
              delay: 75,
              deleteSpeed: 30,
            }}
          />
        </div>
        <ActionButton text="開始遊戲" href="/chapter00" variant="gold" />
      </div>

      {/* 右：插圖佔位 */}
      <Placeholder label="[前情提要插圖]" className="w-full h-full" />
    </div>
  );
}
