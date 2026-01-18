"use client";

import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type BadgeVariant = "default" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses = {
  default:
    "bg-zinc-900/10 text-zinc-900 dark:bg-zinc-50/20 dark:text-zinc-50",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
