"use client";

import dynamic from "next/dynamic";

import ActionButton from "../../component/ActionButton";

const Typewriter = dynamic(() => import("typewriter-effect"), {
  ssr: false,
});


export default function Description() {
  return (
    <div className="w-full h-screen flex gap-8 items-center bg-gray-200 p-8">

        <div className="w-1/2 flex flex-col items-start justify-center gap-12 pl-8">
          <p className="text-xl font-bold">前情提要</p>
          <div className="">
            <Typewriter
              options={{
                strings: ['很久以前，有一對兄妹分別叫作漢賽爾與葛麗特。他們的家境非常貧窮，遇上大饑荒時，繼母狠心地說服了軟弱的父親，決定把孩子們帶到森林深處丟掉，省下口糧。',
                          '漢賽爾很聰明，第一次他偷偷在口袋裡裝滿了白色小石子，沿路丟下。當月亮升起，石子閃閃發光，引導他們平安回到了家。', 
                          '不久後，繼母又打算丟掉他們。這次漢賽爾沒機會撿石頭，只好把僅有的一塊麵包搓成碎屑撒在路上。',
                          '遺憾的是，當他們想回家時，發現森林裡的鳥兒早就把麵包屑吃光了。兩兄妹在森林裡迷了路，又餓又累。',
                          '絕望之際，兄妹倆看到了一棟神奇的房子……'],
                autoStart: true,
                loop: true,
                delay: 80,
                deleteSpeed: 40
              }}
            />
          </div>
          
          <ActionButton text="開始遊戲" href="/chapter00" />

        </div>

      

    
      {/* <ActionButton text="開始遊戲" href="/discription" /> */}
    </div>
  );
}
