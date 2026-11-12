import { LEVEL_LABEL, type Level } from "@/lib/rules";

const STYLE: Record<Level, string> = {
  high: "bg-high-soft text-high",
  mid: "bg-mid-soft text-mid",
  low: "bg-low-soft text-low",
};

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${STYLE[level]}`}
    >
      {LEVEL_LABEL[level]}
    </span>
  );
}
