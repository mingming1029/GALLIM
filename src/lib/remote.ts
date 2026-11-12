import type { Level } from "@/lib/koras";
import type { FinalDecision } from "@/lib/judgment";
import { ensureAnonymousSession, getSupabase } from "@/lib/supabase";

export type Judgment = {
  id: string;
  caseId: string;
  itemScores: Record<number, number>;
  myTotal: number;
  myLevel: Level;
  aiTotal: number;
  aiLevel: Level;
  finalDecision: string;
  reasonCategory: string;
  reasonText: string;
  createdAt: string;
};

export type DataView =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "error"; message: string }
  | { status: "ready"; judgments: Judgment[]; notice: string | null };

const serverView: DataView = { status: "loading" };
let view: DataView = serverView;
const listeners = new Set<() => void>();
let started = false;

function publish(next: DataView) {
  view = next;
  listeners.forEach((listener) => listener());
}

export function subscribeData(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    void refresh();
  }
  return () => {
    listeners.delete(listener);
  };
}

export function getDataSnapshot() {
  return view;
}

export function getDataServerSnapshot() {
  return serverView;
}

const LEVELS: readonly Level[] = ["낮음", "중간", "높음"];

function asLevel(value: string): Level | null {
  return LEVELS.find((level) => level === value) ?? null;
}

function asScores(value: unknown): Record<number, number> {
  const scores: Record<number, number> = {};
  if (!value || typeof value !== "object") return scores;
  for (const [key, score] of Object.entries(value as Record<string, unknown>)) {
    const no = Number(key);
    const numeric = typeof score === "number" ? score : Number(score);
    if (Number.isInteger(no) && Number.isFinite(numeric)) scores[no] = numeric;
  }
  return scores;
}

type JudgmentRow = {
  id: string;
  case_id: string;
  item_scores: unknown;
  my_total: number;
  my_level: string;
  ai_total: number;
  ai_level: string;
  final_decision: string;
  reason_category: string | null;
  reason_text: string | null;
  created_at: string;
};

function asJudgment(row: JudgmentRow): Judgment | null {
  const myLevel = asLevel(row.my_level);
  const aiLevel = asLevel(row.ai_level);
  if (!myLevel || !aiLevel) return null;
  return {
    id: row.id,
    caseId: row.case_id,
    itemScores: asScores(row.item_scores),
    myTotal: row.my_total,
    myLevel,
    aiTotal: row.ai_total,
    aiLevel,
    finalDecision: row.final_decision,
    reasonCategory: row.reason_category ?? "",
    reasonText: row.reason_text ?? "",
    createdAt: row.created_at,
  };
}

function explainQuery(message: string) {
  if (/anonymous/i.test(message)) {
    return "익명 로그인이 꺼져 있습니다. Authentication > Sign In / Providers에서 Anonymous를 켜 주세요.";
  }
  if (/does not exist|schema cache|Could not find the table/i.test(message)) {
    return "judgments 테이블이 없습니다. SQL Editor에서 supabase/schema_v2.sql을 실행해 주세요.";
  }
  if (/row-level security|permission denied|42501/i.test(message)) {
    return "행을 읽거나 쓰지 못했습니다. schema_v2.sql의 정책과 grant가 실행됐는지 확인해 주세요.";
  }
  return message;
}

async function loadReady(): Promise<DataView> {
  const supabase = getSupabase();
  if (!supabase) return { status: "unconfigured" };
  const authError = await ensureAnonymousSession(supabase);
  if (authError) return { status: "error", message: authError };

  const result = await supabase.from("judgments").select("*");
  if (result.error) return { status: "error", message: explainQuery(result.error.message) };

  return {
    status: "ready",
    judgments: (result.data as JudgmentRow[])
      .map(asJudgment)
      .filter((row): row is Judgment => row !== null),
    notice: null,
  };
}

export async function refresh() {
  publish(await loadReady());
}

export async function addJudgment(input: {
  caseId: string;
  itemScores: Record<number, number>;
  myTotal: number;
  myLevel: Level;
  aiTotal: number;
  aiLevel: Level;
  finalDecision: FinalDecision;
  reasonCategory: string;
  reasonText: string;
}) {
  const supabase = getSupabase();
  if (!supabase) return "Supabase 주소와 키가 없습니다.";
  const scores: Record<string, number> = {};
  for (const [no, score] of Object.entries(input.itemScores)) scores[no] = score;
  const { error } = await supabase.from("judgments").insert({
    id: crypto.randomUUID(),
    case_id: input.caseId,
    item_scores: scores,
    my_total: input.myTotal,
    my_level: input.myLevel,
    ai_total: input.aiTotal,
    ai_level: input.aiLevel,
    final_decision: input.finalDecision,
    reason_category: input.reasonCategory,
    reason_text: input.reasonText,
  });
  if (error) return explainQuery(error.message);
  await refresh();
  return null;
}
