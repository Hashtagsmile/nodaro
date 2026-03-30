import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "muted";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono",
        variant === "default" && "bg-zinc-800 text-zinc-400",
        variant === "success" && "bg-emerald-900/40 text-emerald-400",
        variant === "muted" && "bg-zinc-900 text-zinc-600",
        className,
      )}
      {...props}
    />
  );
}
