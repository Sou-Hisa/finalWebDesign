"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

type ActionButtonProps = {
  text?: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  disabled?: boolean;
  variant?: "gold" | "red" | "purple" | "ghost";
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;

const variantClass = {
  gold:   "border-[var(--color-gold)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-stone-950 border-glow-gold",
  red:    "border-[var(--color-candy-red)] text-[var(--color-candy-red)] hover:bg-[var(--color-candy-red)] hover:text-white",
  purple: "border-[var(--color-purple)] text-[var(--color-purple)] hover:bg-[var(--color-purple)] hover:text-white border-glow-purple",
  ghost:  "border-stone-600 text-stone-400 hover:bg-stone-800 hover:text-stone-100",
};

export default function ActionButton({
  text,
  href,
  onClick,
  disabled = false,
  variant = "gold",
  className = "",
  children,
  ...rest
}: ActionButtonProps) {
  const base = [
    "border-2 px-6 py-2 font-ui font-medium tracking-wider transition-all duration-300",
    "disabled:opacity-40 disabled:cursor-not-allowed",
    variantClass[variant],
    className,
  ].join(" ");

  const label = text ?? children ?? "button";

  if (href) {
    return (
      <motion.div whileHover={{ scale: disabled ? 1 : 1.04 }} whileTap={{ scale: disabled ? 1 : 0.94 }}>
        <Link
          href={href}
          className={base}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (disabled) e.preventDefault();
            if (onClick) onClick(e as React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>);
          }}
        >
          {label}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ scale: disabled ? 1 : 1.04 }} whileTap={{ scale: disabled ? 1 : 0.94 }}>
      <button type="button" className={base} onClick={onClick} disabled={disabled} {...rest}>
        {label}
      </button>
    </motion.div>
  );
}
