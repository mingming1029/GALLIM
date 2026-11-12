import { buildCase, randomCase, type JudgmentRecord, type Level, type MemoDir, type ProbationCase, type DecisionKey, type CaseSource, type FactorRow } from "@/lib/rules";
import { ensureAnonymousSession, getSupabase } from "@/lib/supabase";

export type DataView =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      cases: ProbationCase[];
      records: JudgmentRecord[];
      notice: string | null;
    };

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

type CaseRow = {
  id: string;
  code: string;
  is_example: boolean;
  source: string;
  age_band: string;
  months: number;
  factors: FactorRow[];
  score: number;
  level: Level;
  memo: string | null;
  memo_dir: string | null;
  memo_cat: string | null;
  created_at: string;
};

type RecordRow = {
  id: string;
  case_id: string;
  is_example: boolean;
  level: Level;
  decision: DecisionKey;
  reason_cat: string | null;
  reason_text: string | null;
  created_at: string;
};

function asCase(row: CaseRow): ProbationCase {
  const source: CaseSource = row.source === "manual" ? "manual" : "generated";
  const memoDir: MemoDir =
    row.memo_dir === "pos" || row.memo_dir === "neg" || row.memo_dir === "neu"
      ? row.memo_dir
      : "neu";
  return {
    id: row.id,
    code: row.code,
    age: row.age_band,
    months: row.months,
    score: row.score,
    level: row.level,
    factors: row.factors,
    memo: row.memo ?? "",
    memoDir,
    memoCat: row.memo_cat ?? "기타",
    createdAt: row.created_at,
    example: row.is_example,
    source,
  };
}

function asRecord(row: RecordRow): JudgmentRecord {
  return {
    id: row.id,
    caseId: row.case_id,
    lv: row.level,
    d: row.decision,
    cat: row.reason_cat ?? "",
    txt: row.reason_text ?? "",
    at: row.created_at,
    example: row.is_example,
  };
}

function explainQuery(message: string) {
  if (/anonymous/i.test(message)) {
    return "익명 로그인이 꺼져 있습니다. Authentication > Sign In / Providers에서 Anonymous를 켜 주세요.";
  }
  if (/does not exist|schema cache|Could not find the table/i.test(message)) {
    return "테이블이 없습니다. SQL Editor에서 supabase/schema.sql을 실행한 뒤 supabase/seed.sql을 실행해 주세요.";
  }
  if (/row-level security|permission denied|42501/i.test(message)) {
    return "행을 읽거나 쓰지 못했습니다. schema.sql의 정책과 grant가 실행됐는지 확인해 주세요.";
  }
  return message;
}

async function loadReady(): Promise<DataView> {
  const supabase = getSupabase();
  if (!supabase) return { status: "unconfigured" };
  const authError = await ensureAnonymousSession(supabase);
  if (authError) return { status: "error", message: authError };

  const casesResult = await supabase.from("cases").select("*");
  if (casesResult.error) {
    return { status: "error", message: explainQuery(casesResult.error.message) };
  }
  const recordsResult = await supabase.from("records").select("*");
  if (recordsResult.error) {
    return { status: "error", message: explainQuery(recordsResult.error.message) };
  }

  return {
    status: "ready",
    cases: (casesResult.data as CaseRow[]).map(asCase),
    records: (recordsResult.data as RecordRow[]).map(asRecord),
    notice: null,
  };
}

export async function refresh() {
  publish(await loadReady());
}

function nextCounter(cases: ProbationCase[]) {
  let max = 0;
  for (const item of cases) {
    const match = /^K-(\d+)$/.exec(item.code);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max;
}

async function insertCases(created: ProbationCase[]) {
  const current = view;
  if (current.status !== "ready") return null;
  const supabase = getSupabase();
  if (!supabase) return null;
  const { error } = await supabase.from("cases").insert(
    created.map((item) => ({
      id: item.id,
      code: item.code,
      is_example: false,
      source: item.source,
      age_band: item.age,
      months: item.months,
      factors: item.factors,
      score: item.score,
      level: item.level,
      memo: item.memo,
      memo_dir: item.memoDir,
      memo_cat: item.memoCat,
      created_at: item.createdAt,
    })),
  );
  if (error) {
    publish({ ...current, notice: explainQuery(error.message) });
    return null;
  }
  await refresh();
  return created;
}

export async function addCases(count: number) {
  const current = view;
  if (current.status !== "ready") return null;
  const source = { counter: nextCounter(current.cases) };
  const created = Array.from({ length: count }, () => randomCase(source, false));
  return insertCases(created);
}

export async function addManual(
  levels: readonly Level[],
  age: string,
  months: number,
  memo: { t: string; dir: MemoDir; cat: string } | null,
) {
  const current = view;
  if (current.status !== "ready") return null;
  const source = { counter: nextCounter(current.cases) };
  const created = buildCase(source, levels, age, months, memo, false);
  created.source = "manual";
  const saved = await insertCases([created]);
  return saved?.[0] ?? null;
}

export async function addRecord(
  item: ProbationCase,
  decision: DecisionKey,
  reasonCat: string,
  reasonText: string,
) {
  const supabase = getSupabase();
  if (!supabase) return "Supabase 주소와 키가 없습니다.";
  const { error } = await supabase.from("records").insert({
    id: crypto.randomUUID(),
    case_id: item.id,
    is_example: false,
    level: item.level,
    decision,
    reason_cat: reasonCat,
    reason_text: reasonText.slice(0, 60),
  });
  if (error) return explainQuery(error.message);
  await refresh();
  return null;
}
