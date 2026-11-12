import type { Level } from "@/lib/koras";

const STYLE: Record<Level, string> = {
  높음: "bg-high-soft text-high",
  중간: "bg-mid-soft text-mid",
  낮음: "bg-low-soft text-low",
};

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${STYLE[level]}`}
    >
      {level}
    </span>
  );
}
