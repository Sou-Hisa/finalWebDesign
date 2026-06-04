import Image from "next/image";
import Link from "next/link";

import ActionButton from "../component/ActionButton";


export default function Home() {
  return (
    <div className="w-full h-screen flex flex-col gap-8 items-center justify-center bg-gray-200">
      <p className="text-3xl font-bold text-white">逃離糖果屋</p>
      <p>遊戲時間 | 15分鐘</p>
      <p>開發團隊 | 宋書緹 周湧秝 馮妍嘉 陳柏硯 王浩川</p>

      <ActionButton text="開始遊戲" href="/discription" />
    </div>
  );
}