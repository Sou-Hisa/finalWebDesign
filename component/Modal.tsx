"use client";

import { ReactNode } from "react";

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
}

export default function Modal({ title, children, onClose, closeLabel = "確認" }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md mx-4 border-2 border-black bg-white p-6 flex flex-col gap-4 shadow-xl">
        <h2 className="text-xl font-bold text-center">{title}</h2>
        <div className="text-base leading-relaxed">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="self-center border-2 border-black px-8 py-2 font-medium hover:bg-black hover:text-white transition-colors"
          >
            {closeLabel}
          </button>
        )}
      </div>
    </div>
  );
}
