"use client"
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { FaVolumeMute } from "react-icons/fa";
import { FaVolumeUp } from "react-icons/fa";

export default function BgMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const handleFirstClickRef = useRef<() => void>(() => {});
  const [isPlaying, setIsPlaying] = useState(false);
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const pathname = usePathname();
  const src = pathname?.startsWith("/battle")
    ? "/audio/Take a Chance.mp3"
    : "/audio/Dreamy Flashback.mp3";

  useEffect(() => {
    const prevAudio = audioRef.current;
    const wasPlaying = isPlaying;

    if (prevAudio) {
      prevAudio.pause();
      document.removeEventListener("click", handleFirstClickRef.current);
    }

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.4;
    audioRef.current = audio;

    if (wasPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      // 先嘗試自動播放（大部分瀏覽器會封鎖，若被封鎖會抓到錯誤並保留下方的點擊備援）
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay 被封鎖，使用者互動作為備援
        });
    }

    // 定義首次點擊自動播放的備援邏輯（在某些瀏覽器必須由 user gesture 啟動）
    const handleFirstClick = () => {
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => console.log("播放被阻擋:", err));

      document.removeEventListener("click", handleFirstClick);
    };

    // 將 reference 存起來，讓 toggleBgm 也能存取並移除它
    handleFirstClickRef.current = handleFirstClick;
    document.addEventListener("click", handleFirstClick);

    return () => {
      audio.pause();
      document.removeEventListener("click", handleFirstClick);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const toggleBgm = () => {
    if (!audioRef.current) return;

    // 使用者一旦主動點了按鈕，不論是開是關，都解除全域的監聽，避免自動播放邏輯干擾
    if (handleFirstClickRef.current) {
      document.removeEventListener("click", handleFirstClickRef.current);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => console.log("播放被阻擋:", err));
    }
  };

  if (!isClient) return null;

  return createPortal(
    <button
      onClick={toggleBgm}
      data-html2canvas-ignore="true"
      className="fixed top-4 right-4 z-9999 px-4 py-2 hover:scale-105 transition-all"
    >
      {isPlaying ? <FaVolumeUp className="w-5 h-5 text-gray-200" /> : <FaVolumeMute className="w-5 h-5 text-gray-200" />}
    </button>,
    document.body
  );
}