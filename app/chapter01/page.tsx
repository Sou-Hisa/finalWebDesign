"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/store";
import DialogueBox from "../../component/DialogueBox";


export default function Chapter01() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const dialogues = useGameStore((s) => s.chapter01Dialogues);

  const current = dialogues[index];
  const isLast = index === dialogues.length - 1;

  function handleNext() {
    if (isLast) router.push("/interlude");
    else setIndex((i) => i + 1);
  }

  return (
    <div className="w-full h-screen flex flex-col ">
      {/* 主場景 */}
      <div className="flex-1 relative bg-black">
        <div
          className="
            absolute inset-0
            bg-[url('/images/ch01_bg.png')]
            bg-auto
            bg-center
            bg-no-repeat
          "
          style={{
            backgroundSize: "auto 100%",
          }}
        />
        <div className="absolute inset-0 bg-black/55" />
        {/* 兄妹倆：漢賽爾說話時從左滑入 */}
        <AnimatePresence>
          {current.character === "漢賽爾" && (
            <motion.div
              key="siblings"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 180, damping: 26 }}
              className="absolute bottom-25 left-4 flex"
            >
              <div className="relative w-45 h-60">
                <Image src="/item_images/hansel_surprised.png" alt="漢賽爾" fill sizes="120px" className="object-contain object-bottom" />
              </div>
              <div className="relative w-45 h-60 -ml-6">
                <Image src="/item_images/gretel_surprised.png" alt="葛麗特" fill sizes="120px" className="object-contain object-bottom" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 老婆婆 */}
        <div className="absolute bottom-25 right-20 w-45 h-60">
          <Image
            src="/item_images/granny.png"
            alt="老婆婆 立繪"
            fill
            priority
            sizes="120px"
            className="object-contain object-bottom"
          />
        </div>
      </div>

      {/* 對話框 */}
        <DialogueBox
          character={current.character}
          text={current.text}
          onNext={handleNext}
          isLast={isLast}
          lastLabel="進入屋內"
        />
    </div>
  );
}
