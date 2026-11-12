export const FINAL_DECISIONS = ["도구 수준 그대로", "더 높게", "더 낮게"] as const;

export type FinalDecision = (typeof FINAL_DECISIONS)[number];

export const REASON_CATEGORIES = [
  "문항 해석이 달랐다",
  "도구에 없는 정보(현장 메모 등)",
  "기록이 불충분했다",
  "기타",
] as const;

export type ReasonCategory = (typeof REASON_CATEGORIES)[number];

export function differsFromTool(decision: string) {
  return decision !== "도구 수준 그대로";
}
