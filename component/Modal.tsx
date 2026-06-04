"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
}

export default function Modal({ title, children, onClose, closeLabel = "確認" }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.82, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        exit={{   scale: 0.88,  opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="w-full max-w-md mx-4 border-2 p-6 flex flex-col gap-4 shadow-2xl"
        style={{
          borderColor: "var(--color-gold)",
          background: "linear-gradient(160deg, #1a0c05ee, #0d0705ee)",
          boxShadow: "0 0 30px #f5a62333, inset 0 0 20px #f5a62311",
        }}
      >
        <h2 className="text-xl font-title text-center text-glow-gold" style={{ color: "var(--color-gold)" }}>
          {title}
        </h2>
        <div className="font-body text-[#f0e0c0] leading-relaxed">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="self-center border-2 border-(--color-gold) text-(--color-gold) px-8 py-2 font-ui font-medium tracking-wider hover:bg-(--color-gold) hover:text-stone-950 transition-all duration-300 border-glow-gold"
          >
            {closeLabel}
          </button>
        )}
      </motion.div>
    </div>
  );
}
