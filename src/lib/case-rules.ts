import { KORAS_ITEMS, levelOf, totalOf, type DemoCase, type Level } from "@/lib/koras";

type Crime = { name: string; score: 0 | 1 | 2 | 3 };
type Fact = { name: string; attempt: boolean };
type Tone = "긍정" | "부정" | "중립";

const CRIMES: Crime[] = [
  { name: "야간 주거침입 절도", score: 1 },
  { name: "강제추행", score: 2 },
  { name: "상해", score: 2 },
  { name: "폭행", score: 2 },
  { name: "강도", score: 2 },
  { name: "방화", score: 2 },
  { name: "협박", score: 1 },
  { name: "절도", score: 1 },
  { name: "재물손괴", score: 0 },
  { name: "업무방해", score: 0 },
];

const CRIME_SOURCE = [...CRIMES]
  .sort((left, right) => right.name.length - left.name.length)
  .map((crime) => crime.name)
  .join("|");

const MEMOS: Record<Tone, string[]> = {
  긍정: [
    "물류센터 채용이 확정되었고, 가족이 면담에 동행하겠다고 함.",
    "주거지가 한 곳에서 1년째 유지되고, 이웃과 마찰 기록이 없음.",
    "상담 일정표를 직접 가져와 다음 주 참여를 확인함.",
  ],
  부정: [
    "면담 일정을 두 번 연속 미뤘고, 거주지 확인이 되지 않음.",
    "피해 회복 계획을 묻자 답을 피하고 목소리를 높임.",
    "가족 연락이 닿지 않고, 일할 곳도 아직 없음.",
  ],
  중립: [
    "면담에서 질문에 짧게 답했고, 그 밖의 생활 변화는 확인되지 않음.",
    "정해진 면담에는 나왔고, 특별히 달라진 사정은 말하지 않음.",
  ],
};

export type CaseCheck = { ok: boolean; reasons: string[] };

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function between(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function tableScore(name: string) {
  return CRIMES.find((crime) => crime.name === name)?.score;
}

export function scoredCrime(name: string, attempt: boolean) {
  const score = tableScore(name);
  if (score === undefined) return null;
  return attempt ? Math.max(0, score - 1) : score;
}

function ageBand(age: number) {
  if (age < 30) return 3;
  if (age < 45) return 2;
  if (age < 60) return 1;
  return 0;
}

function arrestBand(age: number) {
  if (age < 19) return 2;
  if (age < 25) return 1;
  return 0;
}

function recordLine(item: DemoCase, label: string) {
  return item.record.find((row) => row.label === label)?.value ?? "";
}

function parseCrimes(text: string) {
  const pattern = new RegExp(`(${CRIME_SOURCE})(?:\\s*미수)?\\s*(\\d+)건`, "g");
  const found: { name: string; attempt: boolean; count: number; each: number }[] = [];
  for (const match of text.matchAll(pattern)) {
    const name = match[1];
    const attempt = match[0].includes("미수");
    const count = Number(match[2]);
    const each = scoredCrime(name, attempt);
    if (each === null || !Number.isInteger(count) || count < 1) continue;
    found.push({ name, attempt, count, each });
  }
  return found;
}

function priorScores(history: string): { scores: number[] } | { error: string } {
  const none = history.includes("전과 없음");
  const clause = history.match(/과거\s+([^.]*)/);
  if (none && clause) return { error: "전과 없음과 과거 범죄가 함께 있습니다." };
  if (none) return { scores: [] };
  if (!clause) return { error: "과거 범죄 문장이 없습니다." };
  const crimes = parseCrimes(clause[1]);
  if (!crimes.length) return { error: "과거 범죄 죄명을 읽지 못했습니다." };
  return { scores: crimes.flatMap((crime) => Array.from({ length: crime.count }, () => crime.each)) };
}

function countBand(count: number) {
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

function pclScore(text: string) {
  const match = text.match(/PCL-R\s*(\d+)점/);
  if (!match) return null;
  const score = Number(match[1]);
  if (score <= 5) return 0;
  if (score <= 20) return 1;
  if (score <= 25) return 2;
  return 3;
}

function vulnScore(text: string) {
  if (text.includes("취약요인 없음")) return 0;
  const match = text.match(/취약요인\s*(\d+)개/);
  if (!match) return null;
  const count = Number(match[1]);
  if (count <= 0) return 0;
  if (count === 1) return 1;
  return 2;
}

function substanceScore(text: string) {
  if (text.includes("음주·약물 해당 없음")) return 0;
  if (/음주|약물|AUDIT-K/.test(text)) return 1;
  return null;
}

function sanctionScore(text: string) {
  if (/처분 취소|보호관찰 중 재범|처분 중 재범/.test(text)) return 2;
  if (/규칙위반|징벌/.test(text)) return 1;
  return 0;
}

function responsibilityScore(text: string) {
  if (text.includes("책임 회피")) return 1;
  if (text.includes("책임 수용")) return 0;
  return null;
}

export function validateGeneratedCase(item: DemoCase): CaseCheck {
  const reasons: string[] = [];
  const scores = item.aiScores;
  const history = recordLine(item, "입건 이력");
  const profile = recordLine(item, "나이·학력·혼인");
  const crimeText = recordLine(item, "본 범행");
  const statement = recordLine(item, "진술");
  const exam = recordLine(item, "검사·기타");
  const age = Number(profile.match(/만\s*(\d+)세/)?.[1]);
  const firstAge = Number(history.match(/최초 입건 만\s*(\d+)세/)?.[1]);

  if (!Number.isInteger(age) || !Number.isInteger(firstAge)) {
    reasons.push("현재 나이 또는 최초 입건 나이를 읽지 못했습니다.");
  } else {
    if (firstAge > age) reasons.push("4번 최초 입건 나이가 1번 현재 나이보다 큽니다.");
    if (scores[1] !== ageBand(age)) reasons.push("1번 점수가 현재 나이 구간과 다릅니다.");
    if (scores[4] !== arrestBand(firstAge)) reasons.push("4번 점수가 최초 입건 나이 구간과 다릅니다.");
    if (scores[5] === 1 && firstAge >= 19) reasons.push("5번 소년원 수용이 있는데 최초 입건 나이가 19세 이상입니다.");
  }

  const housed = history.includes("소년원 4개월 수용");
  const notHoused = history.includes("소년원 수용 경험 없음");
  if (housed && notHoused) reasons.push("소년원 수용과 없음이 함께 있습니다.");
  if ((scores[5] === 1) !== housed) reasons.push("5번 점수가 소년원 문장과 다릅니다.");

  const priors = priorScores(history);
  if ("error" in priors) {
    reasons.push(priors.error);
  } else {
    const highest = priors.scores.length ? Math.max(...priors.scores) : 0;
    const violent = priors.scores.filter((score) => score >= 2).length;
    if (scores[6] !== highest) reasons.push("6번이 과거 범죄의 가장 높은 점수와 다릅니다.");
    if (scores[7] !== countBand(violent)) reasons.push("7번이 과거 범죄 중 2점 이상 죄명의 횟수와 다릅니다.");
    if (scores[7] > 0 && scores[6] < 2) reasons.push("7번에 횟수가 있는데 6번이 2점 미만입니다.");
    if (scores[6] >= 2 && scores[7] === 0) reasons.push("6번이 2점 이상인데 7번 횟수가 없습니다.");
  }

  const current = parseCrimes(crimeText)[0];
  if (!current) {
    reasons.push("본 범행 죄명을 읽지 못했습니다.");
  } else if (scores[12] !== current.each) {
    reasons.push("12번이 본 범행 죄명표와 다릅니다. 미수는 한 단계 낮아야 합니다.");
  }

  if ((scores[12] ?? 0) < 2 && scores[8] !== 0) {
    reasons.push("8번은 본 범행(12번)이 2점 이상일 때만 점수가 붙습니다.");
  }

  const checks: [number, number | null, string][] = [
    [9, sanctionScore(history), "9번이 처분기간 문장과 다릅니다."],
    [11, substanceScore(exam), "11번이 음주·약물 문장과 다릅니다."],
    [14, responsibilityScore(statement), "14번이 책임 문장과 다릅니다."],
    [16, pclScore(exam), "16번이 PCL-R 문장과 다릅니다."],
    [17, vulnScore(exam), "17번이 취약요인 문장과 다릅니다."],
  ];
  checks.forEach(([no, expected, message]) => {
    if (expected === null || scores[no] !== expected) reasons.push(message);
  });

  KORAS_ITEMS.forEach((question) => {
    const score = scores[question.no];
    if (!question.options.some((option) => option.score === score)) {
      reasons.push(`${question.no}번 점수가 선택지에 없습니다.`);
    }
  });

  return { ok: reasons.length === 0, reasons };
}

function formatFacts(facts: Fact[]) {
  const counts = new Map<string, number>();
  facts.forEach((fact) => {
    const label = fact.attempt ? `${fact.name} 미수` : fact.name;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  return [...counts].map(([label, count]) => `${label} ${count}건`).join(", ");
}

function memoFor(level: Level) {
  const roll = Math.random();
  const tone: Tone =
    level === "높음"
      ? roll < 0.55
        ? "긍정"
        : roll < 0.8
          ? "중립"
          : "부정"
      : level === "낮음"
        ? roll < 0.55
          ? "부정"
          : roll < 0.8
            ? "중립"
            : "긍정"
        : roll < 0.34
          ? "긍정"
          : roll < 0.67
            ? "부정"
            : "중립";
  return { tone, text: pick(MEMOS[tone]) };
}

export function buildGeneratedCase(id: string): DemoCase {
  const ageBandPick = pick([
    { score: 3, min: 19, max: 29 },
    { score: 2, min: 30, max: 44 },
    { score: 1, min: 45, max: 59 },
    { score: 0, min: 60, max: 72 },
  ]);
  const age = between(ageBandPick.min, ageBandPick.max);
  const arrestScore: 0 | 1 | 2 = age < 25 ? pick([1, 2] as const) : pick([0, 0, 1, 2] as const);
  let firstAge =
    arrestScore === 2 ? between(14, Math.min(18, age)) : arrestScore === 1 ? between(19, Math.min(24, age)) : between(25, age);
  if (firstAge > age) firstAge = age;
  const juvenile = arrestScore === 2 && firstAge < 19 && Math.random() < 0.45;
  const catalog = CRIMES.filter((crime) => crime.name !== "강제추행" && crime.name !== "방화");
  const makeFact = (): Fact => {
    const crime = pick(catalog);
    return { name: crime.name, attempt: crime.score > 0 && Math.random() < 0.35 };
  };
  const current = makeFact();
  const priorTotal = firstAge < age ? pick([0, 0, 0, 1, 1, 2, 3]) : 0;
  const priors = Array.from({ length: priorTotal }, makeFact);
  const currentPoints = scoredCrime(current.name, current.attempt) ?? 0;
  const priorPoints = priors.map((fact) => scoredCrime(fact.name, fact.attempt) ?? 0);
  const highest = priorPoints.length ? Math.max(...priorPoints) : 0;
  const violent = priorPoints.filter((score) => score >= 2).length;
  const sameType =
    currentPoints >= 2 &&
    priors.some((fact) => fact.name === current.name && (scoredCrime(fact.name, fact.attempt) ?? 0) >= 2);
  const eduHigh = Math.random() < 0.55;
  const eduText = eduHigh
    ? pick(["고등학교 졸업", "전문대학 졸업", "4년제 대학 졸업"])
    : pick(["고등학교 중퇴", "중학교 졸업"]);
  let schoolScore: 0 | 1 | 2 = eduHigh ? pick([0, 0, 0, 1] as const) : pick([0, 1, 1, 2] as const);
  if (eduText.includes("중퇴") && schoolScore === 0) schoolScore = 1;
  const married = Math.random() < (age < 26 ? 0.2 : 0.6);
  const scores: Record<number, number> = {
    1: ageBand(age),
    2: eduHigh ? 0 : 1,
    3: married ? 0 : 1,
    4: arrestBand(firstAge),
    5: juvenile ? 1 : 0,
    6: highest,
    7: countBand(violent),
    8: sameType ? 1 : 0,
    9: priors.length ? pick([0, 0, 1, 2] as const) : 0,
    10: schoolScore,
    11: Math.random() < 0.4 ? 1 : 0,
    12: currentPoints,
    13: Math.random() < 0.12 ? 1 : 0,
    14: Math.random() < 0.45 ? 1 : 0,
    15: priors.length > 0 && Math.random() < 0.3 ? 1 : 0,
    16: pick([0, 0, 0, 1, 1, 2, 3] as const),
    17: pick([0, 0, 0, 1, 2] as const),
  };
  const history = [
    firstAge === age ? `최초 입건 만 ${firstAge}세(본 건)` : `최초 입건 만 ${firstAge}세`,
    juvenile ? "소년원 4개월 수용" : "소년원 수용 경험 없음",
    priors.length ? `과거 ${formatFacts(priors)}` : "전과 없음",
  ];
  if (scores[9] === 2) history.push("보호관찰 중 재범");
  else if (scores[9] === 1) history.push("보호관찰 중 규칙위반 1회");
  if (scores[15] === 1) history.push("이전 처분 종료 후 4개월 만에 재범");
  else if (priors.length) history.push("이전 처분 종료 후 1년 이상 경과");
  const marryText = married ? pick(["혼인 중", "사실혼", "이혼(혼인 경험 있음)"]) : "혼인 경험 없음";
  const crime = `${formatFacts([current])}${scores[13] === 1 ? ". 피해자가 다른 같은 종류 범행이 이어진 기록이 3건" : ""}`;
  const statement =
    scores[14] === 1
      ? "상대 탓으로 책임을 돌림(책임 회피)"
      : "자신의 행위를 인정하고 사과함(책임 수용)";
  const pcl = ["PCL-R 4점", "PCL-R 12점", "PCL-R 22점", "PCL-R 28점"][scores[16]];
  const substance =
    scores[11] === 1 ? pick(["범행 당시 음주", "AUDIT-K 14점", "과거 약물 사용"]) : "음주·약물 해당 없음";
  const school = ["학창 시절 문제행동 기록 없음", "학창 시절 무단결석 기록 1개", "학창 시절 수업방해·무단결석·학교폭력 기록"][
    scores[10]
  ];
  const vuln = ["취약요인 없음", "우울증 치료 중, 취약요인 1개", "우울증과 경도 인지 손상, 취약요인 2개"][scores[17]];
  const notes: Record<number, string> = {
    14: scores[14] === 1 ? "진술에 책임 회피가 있어 1점." : "진술에 책임 수용이 있어 0점.",
  };
  if (currentPoints < 2) notes[8] = "본 범행이 2점 미만이라 동종 전과 문항은 0점.";
  if (current.attempt || priors.some((fact) => fact.attempt)) {
    notes[12] = "미수 범죄는 죄명표보다 한 단계 낮게 채점.";
  }

  return {
    id,
    record: [
      { label: "나이·학력·혼인", value: `만 ${age}세 / ${eduText} / ${marryText}` },
      { label: "입건 이력", value: history.join(". ") },
      { label: "본 범행", value: crime },
      { label: "진술", value: statement },
      { label: "검사·기타", value: `${pcl}. ${substance}. ${school}. ${vuln}` },
    ],
    fieldMemo: memoFor(levelOf(totalOf(scores))),
    aiScores: scores,
    aiNotes: notes,
  };
}

export function buildValidatedCase(id: string) {
  const rejected: string[] = [];
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const item = buildGeneratedCase(id);
    const result = validateGeneratedCase(item);
    if (result.ok) return item;
    rejected.push(...result.reasons);
  }
  throw new Error(`규칙을 통과한 사례를 만들지 못했습니다. ${rejected.slice(0, 4).join(" ")}`);
}

export function matchCount(mine: Record<number, number>, reference: Record<number, number>) {
  return KORAS_ITEMS.filter((question) => mine[question.no] === reference[question.no]).length;
}
