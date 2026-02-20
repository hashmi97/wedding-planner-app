import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseNum(v: number | string | undefined | null): number {
  if (v === undefined || v === null || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function calcRemaining(
  quoted: number | string | undefined,
  paid: number | string | undefined
): number {
  return Math.max(0, parseNum(quoted) - parseNum(paid));
}

export function formatAmount(v: number | string | undefined | null): string {
  if (v === undefined || v === null || v === "") return "-";
  const n = parseNum(v);
  const rounded = Math.ceil(n * 100) / 100;
  const s = rounded.toFixed(2);
  return s.endsWith(".00") ? s.slice(0, -3) : s;
}

export function formatDayMonth(dateStr: string | undefined | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr + "T12:00:00");
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en", { month: "short" });
  return `${day}-${month}`;
}
