"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "default" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  variant = "default",
  className,
  ...props
}: ButtonProps) {
  const variantStyles = {
    default:
      "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200",
    ghost:
      "border border-zinc-200 text-zinc-900 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-950",
  };

  return (
    <button
      className={cn(
        "rounded-full px-5 py-2 text-sm font-semibold transition",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
