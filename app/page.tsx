import ActionButton from "../component/ActionButton";

// 純色色塊佔位元件
function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-stone-700 border border-stone-500 text-stone-300 text-xs font-ui ${className}`}>
      {label}
    </div>
  );
}

export default function Home() {
  return (
    <div className="w-full h-screen bg-stone-900 flex relative overflow-hidden">
      {/* 右側背景圖佔位 */}
      <Placeholder label="[首頁背景圖]" className="absolute inset-0 opacity-30" />

      {/* 主內容 */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 w-full">
        <h1 className="font-title text-6xl tracking-widest" style={{ color: "var(--color-gold)" }}>
          糖果屋
        </h1>

        <p className="font-ui text-sm tracking-[0.3em] text-stone-400 uppercase">
          Escape the Candy House
        </p>

        <div className="h-px w-48 bg-stone-600" />

        <div className="flex flex-col items-center gap-1 text-stone-500 text-sm font-ui">
          <p>遊戲時間｜15 分鐘</p>
          <p>開發團隊｜宋書緹 周湧秝 馮妍嘉 陳柏硯 王浩川</p>
        </div>

        <ActionButton text="開始遊戲" href="/description" variant="gold" />
      </div>
    </div>
  );
}
