import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncate(str: string, max = 40): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export function formatCellValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function parseFilterValue(operator: string, raw: string): unknown {
  if (operator === "exists") return raw === "true";
  if (operator === "in" || operator === "nin") {
    return raw.split(",").map((v) => {
      const trimmed = v.trim();
      const n = Number(trimmed);
      return !isNaN(n) && trimmed !== "" ? n : trimmed;
    });
  }
  if (raw === "true") return true;
  if (raw === "false") return false;
  const n = Number(raw);
  if (!isNaN(n) && raw.trim() !== "") return n;
  return raw;
}
