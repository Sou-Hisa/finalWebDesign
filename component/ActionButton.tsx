"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

const MotionLink = motion.create(Link);
const MotionButton = motion.button;

type ActionButtonProps = {
  text?: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  disabled?: boolean;
  variant?: "gold" | "red" | "purple" | "ghost" | "white";
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;

const variantClass = {
  gold:   "border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-white border-glow-gold",
  red:    "border-[var(--color-candy-red)] text-[var(--color-candy-red)] hover:bg-[var(--color-candy-red)] hover:text-white",
  purple: "border-[var(--color-purple)] text-[var(--color-purple)] hover:bg-[var(--color-purple)] hover:text-white border-glow-purple",
  ghost:  "border-stone-600 text-stone-400 hover:bg-stone-800 hover:text-stone-100",
  white:  "border-white/90 text-white/90 hover:bg-white/90 hover:text-gray-600",
};

export default function ActionButton({
  text,
  href,
  onClick,
  disabled = false,
  variant = "gold",
  className = "",
  children,
  // ...rest
}: ActionButtonProps) {
  const base = [
    "inline-flex items-center justify-center text-center border-2 px-6 py-2 font-ui font-medium tracking-wider transition-all duration-300",
    "rounded-md",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    variantClass[variant],
    className,
  ].join(" ");

  const label = text ?? children ?? "button";

  if (href) {
    return (
      <MotionLink
        href={href}
        className={base}
        whileHover={{ scale: disabled ? 1 : 1.04 }}
        whileTap={{ scale: disabled ? 1 : 0.94 }}
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          if (disabled) e.preventDefault();
          if (onClick) onClick(e as React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>);
        }}
      >
        {label}
      </MotionLink>
    );
  }

  return (
    <MotionButton
      type="button"
      className={base}
      whileHover={{ scale: disabled ? 1 : 1.04 }}
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </MotionButton>
  );
}
