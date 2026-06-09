import ActionButton from "../component/ActionButton";

export default function Home() {
  return (
    <div className="w-full h-screen bg-black flex relative overflow-hidden">
      <div
        className="
          absolute inset-0
          bg-[url('/images/front_bg.png')]
          bg-cover
          bg-center
          bg-no-repeat
        "
      />
      <div className="absolute inset-0 bg-black/40" />
          
      {/* 主內容 */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-20 w-full">
        <div>
          <h1 className="font-title text-7xl tracking-widest pb-3" style={{ color: "var(--color-gold)" }}>
            逃離糖果屋
          </h1>
          <p className="font-ui text-md tracking-[0.5em] text-gray-400 uppercase text-center">
            Escape the Candy House
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 text-gray-300 text-md font-ui">
          <p>遊戲時間｜15 分鐘</p>
          <p>開發團隊｜宋書緹 周湧秝 馮妍嘉 陳柏硯 王浩川</p>
        </div>

        <ActionButton text="開始遊戲" href="/description" variant="gold" />
      </div>
    </div>
  );
}
