/**
 * reference/app.js의 FACTORS, scoreOf, levelOf, MEMOS, randomCase,
 * exampleRecord를 같은 호출 순서로 옮긴 규칙. 가중치와 분기 값을 바꾸지 않는다.
 */

export type Level = "low" | "mid" | "high";
export type DecisionKey = "up" | "keep" | "down";
export type MemoDir = "pos" | "neg" | "neu";
export type CaseSource = "generated" | "manual";

export type FactorDef = {
  key: string;
  name: string;
  weight: number;
  opts: readonly (readonly [Level, string])[];
};

export const FACTORS: readonly FactorDef[] = [
  { key: "prior", name: "이전 처분 횟수", weight: 22, opts: [["low", "없음"], ["mid", "1회"], ["high", "2회 이상"]] },
  { key: "housing", name: "주거 상태", weight: 16, opts: [["low", "안정"], ["mid", "임시 거주"], ["high", "자주 변경"]] },
  { key: "work", name: "취업·학업", weight: 18, opts: [["low", "안정적으로 다님"], ["mid", "불안정"], ["high", "없음"]] },
  { key: "support", name: "지원해 줄 사람", weight: 14, opts: [["low", "연락 가능한 가족 여럿"], ["mid", "연락 가능한 1명"], ["high", "없음"]] },
  { key: "care", name: "치료·상담", weight: 14, opts: [["low", "꾸준히 참여"], ["mid", "권고만 받음"], ["high", "거부"]] },
  { key: "habit", name: "음주 등 생활 습관", weight: 16, opts: [["low", "문제 없음"], ["mid", "언급 있음"], ["high", "반복"]] },
];

export const LEVEL_LABEL: Record<Level, string> = {
  high: "높음",
  mid: "중간",
  low: "낮음",
};

export const DECISIONS = [
  { key: "up", label: "감독 강화", hint: "접촉 횟수를 늘림", rank: 2 },
  { key: "keep", label: "현행 유지", hint: "지금 수준 그대로", rank: 1 },
  { key: "down", label: "감독 완화", hint: "접촉 횟수를 줄임", rank: 0 },
] as const;

export const REC: Record<Level, DecisionKey> = {
  high: "up",
  mid: "keep",
  low: "down",
};

export const OUTSIDE = "도구에 없는 정보";

export const CATS: readonly string[] = FACTORS.map((f) => f.name).concat([
  OUTSIDE,
  "기타",
]);

export const AGES = ["20대", "20대", "30대", "30대", "40대", "50대"] as const;

export const MEMOS: readonly { t: string; dir: MemoDir; cat: string }[] = [
  { t: "평가 이후 3개월째 같은 일터에 나가고 있고 출근이 일정합니다.", dir: "pos", cat: "취업·학업" },
  { t: "상담 기관에서 최근 참여 태도가 눈에 띄게 좋아졌다고 알려 왔습니다.", dir: "pos", cat: "치료·상담" },
  { t: "가족과 연락이 다시 시작되어 주 1회 안부를 주고받습니다.", dir: "pos", cat: "지원해 줄 사람" },
  { t: "새 거주지에 자리를 잡고 이웃과 마찰 없이 지냅니다.", dir: "pos", cat: "주거 상태" },
  { t: "최근 면담 일정을 두 번 연속 미뤘습니다.", dir: "neg", cat: OUTSIDE },
  { t: "면담 중 최근 음주가 늘었다고 스스로 말했습니다.", dir: "neg", cat: "음주 등 생활 습관" },
  { t: "일터를 옮겼다고 하는데 확인이 아직 되지 않았습니다.", dir: "neg", cat: "취업·학업" },
  { t: "연락이 닿는 시간이 일정하지 않아 확인에 시간이 걸립니다.", dir: "neg", cat: OUTSIDE },
  { t: "특이 사항 없음. 정해진 면담은 모두 나왔습니다.", dir: "neu", cat: "기타" },
];

export type FactorRow = {
  key: string;
  name: string;
  lv: Level;
  note: string;
};

export type ProbationCase = {
  id: string;
  code: string;
  age: string;
  months: number;
  score: number;
  level: Level;
  factors: FactorRow[];
  memo: string;
  memoDir: MemoDir;
  memoCat: string;
  createdAt: string;
  example: boolean;
  source: CaseSource;
};

export type JudgmentRecord = {
  id: string;
  caseId: string;
  lv: Level;
  d: DecisionKey;
  cat: string;
  txt: string;
  at: string;
  example: boolean;
};

export type IdSource = { counter: number };

function rnd(n: number) {
  return Math.floor(Math.random() * n);
}

function pick<T>(items: readonly T[]): T {
  return items[rnd(items.length)];
}

export function scoreOf(levels: readonly Level[]) {
  let sum = 0;
  let tot = 0;
  FACTORS.forEach((factor, index) => {
    const level = levels[index];
    const value = level === "high" ? 1 : level === "mid" ? 0.5 : 0;
    sum += factor.weight * value;
    tot += factor.weight;
  });
  return Math.round((sum / tot) * 100);
}

export function levelOf(score: number): Level {
  return score < 35 ? "low" : score < 62 ? "mid" : "high";
}

function optionNote(factor: FactorDef, level: Level) {
  for (let i = 0; i < factor.opts.length; i += 1) {
    if (factor.opts[i][0] === level) return factor.opts[i][1];
  }
  return factor.opts[0][1];
}

export function decisionRank(key: DecisionKey) {
  return DECISIONS.filter((item) => item.key === key)[0].rank;
}

export function decisionLabel(key: DecisionKey) {
  return DECISIONS.filter((item) => item.key === key)[0].label;
}

export function differs(record: JudgmentRecord) {
  return record.d !== REC[record.lv];
}

export function direction(record: JudgmentRecord): "완화" | "강화" {
  return decisionRank(record.d) < decisionRank(REC[record.lv]) ? "완화" : "강화";
}

function pad(n: number) {
  return (n < 10 ? "0" : "") + n;
}

export function formatStamp(iso: string) {
  const date = new Date(iso);
  return (
    pad(date.getMonth() + 1) +
    "." +
    pad(date.getDate()) +
    " " +
    pad(date.getHours()) +
    ":" +
    pad(date.getMinutes())
  );
}

export function nextId(source: IdSource) {
  source.counter += 1;
  return "K-" + String(source.counter).padStart(3, "0");
}

export function buildCase(
  source: IdSource,
  levels: readonly Level[],
  age: string,
  months: number,
  memoObj: { t: string; dir: MemoDir; cat: string } | null,
  example: boolean,
): ProbationCase {
  const factors = FACTORS.map((factor, index) => ({
    key: factor.key,
    name: factor.name,
    lv: levels[index],
    note: optionNote(factor, levels[index]),
  }));
  const score = scoreOf(levels);
  return {
    id: crypto.randomUUID(),
    code: nextId(source),
    age,
    months,
    score,
    level: levelOf(score),
    factors,
    memo: memoObj ? memoObj.t : "",
    memoDir: memoObj ? memoObj.dir : "neu",
    memoCat: memoObj ? memoObj.cat : "기타",
    createdAt: new Date().toISOString(),
    example: !!example,
    source: "generated",
  };
}

export function randomCase(source: IdSource, example: boolean) {
  const base = rnd(3);
  const names: Level[] = ["low", "mid", "high"];
  const levels = FACTORS.map(() =>
    Math.random() < 0.6 ? names[base] : names[rnd(3)],
  );
  const level = levelOf(scoreOf(levels));
  const r = Math.random();
  let want: MemoDir;
  if (level === "high") want = r < 0.5 ? "pos" : r < 0.75 ? "neu" : "neg";
  else if (level === "low") want = r < 0.5 ? "neg" : r < 0.75 ? "neu" : "pos";
  else want = r < 0.35 ? "pos" : r < 0.7 ? "neg" : "neu";
  const pool = MEMOS.filter((memo) => memo.dir === want);
  return buildCase(source, levels, pick(AGES), 1 + rnd(18), pick(pool), example);
}

export function exampleRecord(item: ProbationCase): JudgmentRecord {
  const recommended = REC[item.level];
  const rank = decisionRank(recommended);
  let decision: DecisionKey = recommended;
  let cat = "";
  let txt = "";
  if (item.memoDir === "pos" && rank > 0 && Math.random() < 0.8) {
    decision = DECISIONS.filter((entry) => entry.rank === rank - 1)[0].key;
  } else if (item.memoDir === "neg" && rank < 2 && Math.random() < 0.8) {
    decision = DECISIONS.filter((entry) => entry.rank === rank + 1)[0].key;
  }
  if (decision !== recommended) {
    cat = item.memoCat;
    txt = item.memo.slice(0, 60);
  }
  rnd(1e6);
  return {
    id: crypto.randomUUID(),
    caseId: item.id,
    lv: item.level,
    d: decision,
    cat,
    txt,
    at: new Date(Date.now() - rnd(6 * 864e5)).toISOString(),
    example: true,
  };
}

export function sortedCases(cases: ProbationCase[]) {
  return cases.slice().sort((a, b) => (b.createdAt < a.createdAt ? -1 : 1));
}

export function recordsOf(records: JudgmentRecord[], caseId: string) {
  return records
    .filter((record) => record.caseId === caseId)
    .sort((a, b) => (b.at < a.at ? -1 : 1));
}

export function pendingCases(cases: ProbationCase[], records: JudgmentRecord[]) {
  const done = new Set(records.map((record) => record.caseId));
  return sortedCases(cases).filter((item) => !done.has(item.id));
}
