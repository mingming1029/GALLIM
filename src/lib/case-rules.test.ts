import assert from "node:assert/strict";
import test from "node:test";
import { buildGeneratedCase, buildValidatedCase, validateGeneratedCase } from "@/lib/case-rules";
import type { DemoCase } from "@/lib/koras";

function clone(item: DemoCase): DemoCase {
  return structuredClone(item);
}

function line(item: DemoCase, label: string, value: string) {
  item.record = item.record.map((row) => (row.label === label ? { ...row, value } : row));
}

test("생성 사례 100건이 매뉴얼 검증을 통과한다", () => {
  const made = Array.from({ length: 100 }, (_, index) => buildGeneratedCase(`T-${String(index + 1).padStart(3, "0")}`));
  const failures = made.flatMap((item) => {
    const result = validateGeneratedCase(item);
    return result.ok ? [] : [{ id: item.id, reasons: result.reasons, record: item.record, scores: item.aiScores }];
  });
  assert.equal(failures.length, 0, JSON.stringify(failures.slice(0, 3), null, 2));
  assert.ok(
    made.some((item) => item.record.some((row) => row.value.includes("미수"))),
    "100건 안에 미수 범죄가 없어 한 단계 감점 규칙을 확인하지 못했습니다.",
  );
  assert.equal(validateGeneratedCase(buildValidatedCase("retry")).ok, true);
});

test("규칙을 어긴 사례는 검증에서 거절한다", () => {
  const base = buildGeneratedCase("bad");

  const earlyArrest = clone(base);
  line(earlyArrest, "나이·학력·혼인", "만 20세 / 고등학교 졸업 / 혼인 경험 없음");
  line(earlyArrest, "입건 이력", "최초 입건 만 40세. 소년원 수용 경험 없음. 전과 없음");
  assert.ok(validateGeneratedCase(earlyArrest).reasons.some((reason) => reason.includes("4번")));

  const juvenile = clone(base);
  line(juvenile, "입건 이력", "최초 입건 만 30세. 소년원 4개월 수용. 전과 없음");
  juvenile.aiScores = { ...juvenile.aiScores, 5: 1 };
  assert.ok(validateGeneratedCase(juvenile).reasons.some((reason) => reason.includes("19세")));

  const attempt = clone(base);
  line(attempt, "본 범행", "폭행 미수 1건");
  attempt.aiScores = { ...attempt.aiScores, 12: 2, 8: 0 };
  assert.ok(validateGeneratedCase(attempt).reasons.some((reason) => reason.includes("미수")));

  const itemEight = clone(base);
  line(itemEight, "본 범행", "절도 1건");
  itemEight.aiScores = { ...itemEight.aiScores, 12: 1, 8: 1 };
  assert.ok(validateGeneratedCase(itemEight).reasons.some((reason) => reason.includes("8번")));

  const counts = clone(base);
  line(counts, "입건 이력", "최초 입건 만 20세. 소년원 수용 경험 없음. 과거 절도 1건");
  counts.aiScores = { ...counts.aiScores, 6: 2, 7: 1, 4: 1, 5: 0 };
  assert.ok(validateGeneratedCase(counts).reasons.some((reason) => reason.includes("6번") || reason.includes("7번")));

  const exam = clone(base);
  line(exam, "검사·기타", "PCL-R 4점. 음주·약물 해당 없음. 학창 시절 문제행동 기록 없음. 취약요인 없음");
  line(exam, "진술", "자신의 행위를 인정하고 사과함(책임 수용)");
  exam.aiScores = { ...exam.aiScores, 16: 3, 11: 1, 14: 1, 17: 2 };
  const examReasons = validateGeneratedCase(exam).reasons.join(" ");
  assert.match(examReasons, /16번/);
  assert.match(examReasons, /11번/);
  assert.match(examReasons, /14번/);
  assert.match(examReasons, /17번/);

  const sanction = clone(base);
  line(sanction, "입건 이력", "최초 입건 만 20세. 소년원 수용 경험 없음. 과거 절도 1건. 보호관찰 중 재범");
  sanction.aiScores = { ...sanction.aiScores, 9: 0, 6: 1, 7: 0 };
  assert.ok(validateGeneratedCase(sanction).reasons.some((reason) => reason.includes("9번")));
});
