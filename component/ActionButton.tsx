"use client"
import Link from "next/link";
import React from "react";

type ActionButtonProps = {
  /** 文字或節點 */
  text?: React.ReactNode;
  /** 若提供則渲染為 Link，否則為 button */
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function ActionButton({
  text = "button",
  href,
  onClick,
  disabled = false,
  ...rest
}: ActionButtonProps) {
  const FIXED_CLASS = "text-white font-bold border border-gray-700 px-3 py-2 bg-gray-700 shadow-md hover:bg-white hover:text-gray-700 hover:shadow-lg transition-all duration-500";
  const baseClass = `${FIXED_CLASS} ${disabled ? "opacity-50 pointer-events-none" : ""}`.trim();

  if (href) {
    return (
      <div className="flex flex-col justify-center items-center gap-4">
        <Link
          href={href}
          className={baseClass}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (disabled) e.preventDefault();
            if (onClick) onClick(e as React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>);
          }}
        >
          {text}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <button type="button" className={baseClass} onClick={onClick} disabled={disabled} {...rest}>
        {text}
      </button>
    </div>
  );
}