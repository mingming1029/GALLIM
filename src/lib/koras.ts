// src/lib/koras.ts
// KORAS-G(Korean Offender Risk Assessment System-General) 채점 구조와 가상 사례.
// 출처: 한국형사정책연구원 협동연구총서 11-38 「재범방지를 위한 범죄자처우의 과학화에 관한 연구(Ⅱ)」
//       제4장 및 부록(KORAS-G 매뉴얼) + KORAS-G 채점지.
// 아래 사례의 사람·사건·수치는 모두 가상입니다. 실제 사건·대상자와 무관합니다.

export type Option = { label: string; score: number };
export type Item = {
  no: number;
  name: string;
  kind: "static" | "dynamic"; // 정적/동적 구분은 앱 제작자의 분류이며 보고서의 공식 분류가 아님
  options: Option[];
  help: string; // 매뉴얼 요약
};

export const KORAS_ITEMS: Item[] = [
  { no: 1, name: "피의자의 나이(만)", kind: "static", help: "평가 시점의 만 나이. 낮을수록 높은 점수.",
    options: [{ label: "18~30세 미만", score: 3 }, { label: "30~45세 미만", score: 2 }, { label: "45~60세 미만", score: 1 }, { label: "60세 이상", score: 0 }] },
  { no: 2, name: "교육 수준", kind: "static", help: "정규 고등학교 졸업 여부. 검정고시·방송통신고는 고졸에서 제외.",
    options: [{ label: "고졸 미만", score: 1 }, { label: "고졸 이상", score: 0 }] },
  { no: 3, name: "혼인 상태", kind: "static", help: "결혼(사실혼 포함) 또는 1년 이상 동거 경험이 있으면 '있는'.",
    options: [{ label: "혼인 경험이 없는", score: 1 }, { label: "혼인 경험이 있는", score: 0 }] },
  { no: 4, name: "최초 경찰 입건 나이(만)", kind: "static", help: "처음 경찰에 입건된 시점의 만 나이.",
    options: [{ label: "19세 미만", score: 2 }, { label: "19~25세 미만", score: 1 }, { label: "25세 이상", score: 0 }] },
  { no: 5, name: "청소년기 시설 수용 경험", kind: "static", help: "3개월 이상 소년원·소년교도소 수감 경험.",
    options: [{ label: "있음", score: 1 }, { label: "없음", score: 0 }] },
  { no: 6, name: "과거 범죄 점수", kind: "static", help: "본 범행 제외. 죄명표: 살인 3 / 방화·상해·폭행·강간·강제추행·강도 등 2 / 유기·체포감금·협박·절도 1. 미수는 한 단계 아래. 여러 죄명이면 가장 높은 점수.",
    options: [{ label: "3점", score: 3 }, { label: "2점", score: 2 }, { label: "1점", score: 1 }, { label: "0점(해당 없음)", score: 0 }] },
  { no: 7, name: "강력범죄 횟수", kind: "static", help: "죄명표 2점 이상 죄명의 총 횟수. 본 범행 제외, 미수 포함.",
    options: [{ label: "3회 이상", score: 2 }, { label: "1~2회", score: 1 }, { label: "해당사항 없음", score: 0 }] },
  { no: 8, name: "동종 전과 여부(강력범죄일 경우만)", kind: "static", help: "본 범행이 강력범죄일 때만 평가. 아니면 0점.",
    options: [{ label: "동종 전과 있음", score: 1 }, { label: "없음", score: 0 }] },
  { no: 9, name: "처분기간 동안의 문제행동", kind: "dynamic", help: "수형·보호관찰·미결 기간 중. 처분 취소 또는 처분 중 재범 2 / 규칙위반·징벌 1.",
    options: [{ label: "처분 취소 혹은 처분 중 재범", score: 2 }, { label: "규칙위반 혹은 징벌", score: 1 }, { label: "해당사항 없음", score: 0 }] },
  { no: 10, name: "학령기 문제행동", kind: "static", help: "수업방해·무단결석·가출·학교폭력·경고·자퇴/중퇴·강제전학·퇴학 중 해당 개수.",
    options: [{ label: "3개 이상", score: 2 }, { label: "1~2개", score: 1 }, { label: "해당사항 없음", score: 0 }] },
  { no: 11, name: "알코올 혹은 약물 사용", kind: "dynamic", help: "과거 또는 본 범행 시 주취, 현재 알코올 중독(AUDIT-K 13점 이상), 과거 약물 사용 중 1개 이상.",
    options: [{ label: "1개 이상", score: 1 }, { label: "해당사항 없음", score: 0 }] },
  { no: 12, name: "본 범행 점수", kind: "static", help: "본 범행의 죄명을 6번과 같은 죄명표로 채점. 미수는 한 단계 아래.",
    options: [{ label: "3점", score: 3 }, { label: "2점", score: 2 }, { label: "1점", score: 1 }, { label: "0점(해당 없음)", score: 0 }] },
  { no: 13, name: "본 범행의 연쇄범죄 여부", kind: "static", help: "피해자 1인 이상씩 연이어 저질렀고 냉각기가 확인되는 경우.",
    options: [{ label: "3건 이상", score: 1 }, { label: "해당사항 없음", score: 0 }] },
  { no: 14, name: "본 범행에 대한 책임 수용", kind: "dynamic", help: "진술·면담 등 모든 자료로 평가. 책임 회피 1 / 책임 수용 0.",
    options: [{ label: "책임 회피", score: 1 }, { label: "책임 수용", score: 0 }] },
  { no: 15, name: "본 범행 전 재범기간", kind: "static", help: "이전 처분(종료) 후 6개월 이내 재범인지.",
    options: [{ label: "6개월 이내 재범", score: 1 }, { label: "해당사항 없음", score: 0 }] },
  { no: 16, name: "반사회적 성향", kind: "dynamic", help: "PCL-R 또는 MMPI/PAI 반사회성 척도 검사 결과로만 채점.",
    options: [{ label: "PCL-R 26점 이상 (MMPI/PAI 71점 이상)", score: 3 }, { label: "PCL-R 21~25점 (61~70점)", score: 2 }, { label: "PCL-R 6~20점 (50~60점)", score: 1 }, { label: "PCL-R 5점 이하 (49점 이하)", score: 0 }] },
  { no: 17, name: "기타 취약요인", kind: "dynamic", help: "뇌손상, 정신질환, 인지 손상 등에 의한 문제해결능력 부재 중 해당 개수.",
    options: [{ label: "2개 이상", score: 2 }, { label: "1개", score: 1 }, { label: "해당사항 없음", score: 0 }] },
];

export type Level = "낮음" | "중간" | "높음";
export const MAX_SCORE = 30;

export function levelOf(total: number): Level {
  if (total <= 6) return "낮음";
  if (total <= 11) return "중간";
  return "높음";
}

// scores: { [문항번호]: 점수 } -> 합계
export function totalOf(scores: Record<number, number>): number {
  return KORAS_ITEMS.reduce((sum, it) => sum + (scores[it.no] ?? 0), 0);
}

export type DemoCase = {
  id: string;
  record: { label: string; value: string }[]; // 사건기록 요약(가상)
  fieldMemo: { tone: "긍정" | "부정" | "중립"; text: string }; // 도구에 없는 현장 정보(가상)
  aiScores: Record<number, number>; // AI 채점(사전 생성)
  aiNotes: Record<number, string>; // 해석이 필요한 문항에 대한 AI의 근거
};

export const DEMO_CASES: DemoCase[] = [
  {
    id: "K-001",
    record: [
      { label: "나이·학력·혼인", value: "만 52세 / 4년제 대학 졸업 / 혼인 중(25년)" },
      { label: "입건 이력", value: "최초 입건 만 51세(본 건). 전과·보호처분 없음. 소년원 수용 경험 없음" },
      { label: "본 범행", value: "회사 창고에서 물품 반출(절도), 피해 금액 소액, 피해 1건" },
      { label: "진술", value: "수사 단계에서 '제가 가져간 것은 맞다'고 인정. 다만 면담에서 '회사가 먼저 임금을 늦게 줬다'고 말함" },
      { label: "검사·기타", value: "PCL-R 4점. 음주·약물 이력 없음. 학창 시절 문제행동 기록 없음. 정신질환·인지 손상 없음" },
    ],
    fieldMemo: { tone: "부정", text: "면담 중 목소리를 높이고 회사 탓을 반복함. 피해 회복 계획을 묻자 답을 피함." },
    aiScores: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 1, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0 },
    aiNotes: { 14: "수사 단계에서 행위를 인정했으므로 '책임 수용'으로 채점. 면담에서의 변명은 매뉴얼상 별도 감점 근거가 불명확함." },
  },
  {
    id: "K-002",
    record: [
      { label: "나이·학력·혼인", value: "만 41세 / 고등학교 졸업 / 혼인 중" },
      { label: "입건 이력", value: "최초 입건 만 35세(본 건). 전과 없음. 소년원 수용 경험 없음" },
      { label: "본 범행", value: "지인에게 '돈을 갚지 않으면 가만두지 않겠다'는 문자를 반복 발송(협박)" },
      { label: "진술", value: "'겁을 주려던 건 아니었고 감정이 격했다'며 문자 발송 사실을 인정" },
      { label: "검사·기타", value: "PCL-R 8점. AUDIT-K 14점(알코올 사용 문제). 우울증 약물 치료 중. 학창 시절 문제행동 없음" },
    ],
    fieldMemo: { tone: "긍정", text: "정신건강의학과 진료를 꾸준히 받고 있고, 가족이 동행해 면담에 응함. 알코올 상담 프로그램 신청." },
    aiScores: { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 1, 17: 1 },
    aiNotes: {
      11: "AUDIT-K 14점은 13점 이상 기준에 해당하므로 1점.",
      17: "우울증 치료 중이므로 정신질환 1개로 채점. 인지 손상 기록은 없어 2개 이상으로 보지 않음.",
    },
  },
  {
    id: "K-003",
    record: [
      { label: "나이·학력·혼인", value: "만 27세 / 고등학교 졸업 / 혼인 경험 없음" },
      { label: "입건 이력", value: "최초 입건 만 20세. 과거 절도 1건(보호관찰 종료). 소년원 수용 경험 없음" },
      { label: "본 범행", value: "야간 주거침입 절도, 1건" },
      { label: "진술", value: "범행을 인정하고 피해 변상 의사를 밝힘" },
      { label: "검사·기타", value: "PCL-R 12점. 범행 당시 음주 상태. 학창 시절 무단결석 기록 1개. 정신질환·인지 손상 없음. 이전 처분 종료 후 2년 경과" },
    ],
    fieldMemo: { tone: "긍정", text: "물류센터 정규직 채용이 확정됨. 가족이 거주지를 제공하고 월 1회 면담에 동행하겠다고 함." },
    aiScores: { 1: 3, 2: 0, 3: 1, 4: 1, 5: 0, 6: 1, 7: 0, 8: 0, 9: 0, 10: 1, 11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 1, 17: 0 },
    aiNotes: {
      8: "본 범행이 절도(1점)로 강력범죄(2점 이상)가 아니므로 동종 전과 문항은 0점.",
      12: "야간주거침입절도는 죄명표 1점.",
    },
  },
  {
    id: "K-004",
    record: [
      { label: "나이·학력·혼인", value: "만 38세 / 고등학교 졸업 / 혼인 중" },
      { label: "입건 이력", value: "최초 입건 만 27세. 과거 폭행 1건(벌금). 소년원 수용 경험 없음" },
      { label: "본 범행", value: "술자리 시비 끝에 상대에게 상해를 입힘(상해, 1건)" },
      { label: "진술", value: "'먼저 밀친 건 상대방이었다'며 자신의 책임을 일부만 인정. 피해자와는 합의함" },
      { label: "검사·기타", value: "MMPI 반사회성 척도 63점. 범행 당시 음주. 학창 시절 문제행동 없음. 정신질환·인지 손상 없음. 이전 처분 종료 후 3년 경과" },
    ],
    fieldMemo: { tone: "긍정", text: "피해자 합의서와 반성문을 제출함. 면담 중 '술을 끊겠다'며 단주 모임 참석 일정을 가져옴." },
    aiScores: { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 2, 7: 1, 8: 1, 9: 0, 10: 0, 11: 1, 12: 2, 13: 0, 14: 1, 15: 0, 16: 2, 17: 0 },
    aiNotes: {
      14: "합의는 했지만 진술에서 상대방의 책임을 앞세워 '일부만 인정'하므로 책임 회피 1점으로 채점. 이 문항이 바뀌면 합계가 12점에서 11점으로 내려가 수준이 달라짐.",
      16: "MMPI 61~70점 구간이므로 2점.",
    },
  },
  {
    id: "K-005",
    record: [
      { label: "나이·학력·혼인", value: "만 29세 / 고등학교 중퇴 / 혼인 경험 없음" },
      { label: "입건 이력", value: "최초 입건 만 18세. 소년원 4개월 수용. 과거 폭행 3건(2건 확정, 1건 진행)" },
      { label: "본 범행", value: "폭행(1건)" },
      { label: "진술", value: "범행을 인정하고 사과 의사를 밝힘" },
      { label: "검사·기타", value: "PCL-R 22점. 음주 상태 범행. 학창 시절 수업방해·무단결석·학교폭력 기록. 수형 중 징벌 1회. 정신질환·인지 손상 없음. 이전 처분 종료 후 1년 이상 경과" },
    ],
    fieldMemo: { tone: "긍정", text: "치료 프로그램 참여 이력이 있고, 출소 후 거주할 고시원과 취업처가 정해짐. 상담 태도 양호." },
    aiScores: { 1: 3, 2: 1, 3: 1, 4: 2, 5: 1, 6: 2, 7: 2, 8: 1, 9: 1, 10: 2, 11: 1, 12: 2, 13: 0, 14: 0, 15: 0, 16: 2, 17: 0 },
    aiNotes: {
      7: "과거 폭행은 3건이며 진행 중인 1건은 확정되지 않았으나, 매뉴얼은 '저지른' 강력범죄의 총 횟수를 평가하므로 3회로 채점. 진행 중 건을 제외하면 2점이 아니라 1점이 됨.",
      9: "수형 중 징벌 1회는 '규칙위반 혹은 징벌'로 1점.",
    },
  },
  {
    id: "K-006",
    record: [
      { label: "나이·학력·혼인", value: "만 24세 / 고등학교 중퇴 / 혼인 경험 없음" },
      { label: "입건 이력", value: "최초 입건 만 16세. 소년원 8개월 수용. 과거 강도 1건, 폭행 1건" },
      { label: "본 범행", value: "강도상해(1건)" },
      { label: "진술", value: "'그 사람이 먼저 저항해서 다친 것'이라며 책임을 피해자에게 돌림" },
      { label: "검사·기타", value: "PCL-R 27점. 약물 사용 경험. 학령기 문제행동 4개. 보호관찰 중 재범. 이전 처분 종료 후 4개월 만에 재범. 경도 인지 손상 진단" },
    ],
    fieldMemo: { tone: "중립", text: "면담에서 질문에 짧게 답했고, 가족 연락이 닿지 않음. 거주지는 불확실." },
    aiScores: { 1: 3, 2: 1, 3: 1, 4: 2, 5: 1, 6: 2, 7: 1, 8: 1, 9: 2, 10: 2, 11: 1, 12: 2, 13: 0, 14: 1, 15: 1, 16: 3, 17: 1 },
    aiNotes: {
      7: "과거 강도 1건과 폭행 1건이 모두 2점 이상 죄명이므로 2회 → 1점.",
      17: "경도 인지 손상 1개로 채점.",
    },
  },
];