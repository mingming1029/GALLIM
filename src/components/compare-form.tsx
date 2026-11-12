"use client";

import Link from "next/link";
import { useState } from "react";
import { LevelBadge } from "@/components/level-badge";
import {
  KORAS_ITEMS,
  levelOf,
  totalOf,
  type DemoCase,
  type Item,
} from "@/lib/koras";
import {
  FINAL_DECISIONS,
  REASON_CATEGORIES,
  differsFromTool,
  type FinalDecision,
} from "@/lib/judgment";
import { addJudgment } from "@/lib/remote";

function optionLabel(item: Item, score: number) {
  return item.options.find((option) => option.score === score)?.label ?? String(score);
}

export function CompareForm({
  item,
  scores,
}: {
  item: DemoCase;
  scores: Record<number, number>;
}) {
  const myTotal = totalOf(scores);
  const myLevel = levelOf(myTotal);
  const aiTotal = totalOf(item.aiScores);
  const aiLevel = levelOf(aiTotal);
  const levelsDiffer = myLevel !== aiLevel;
  const [decision, setDecision] = useState<FinalDecision | null>(null);
  const [category, setCategory] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const differed = decision !== null && differsFromTool(decision);
  const canSave = decision !== null && (!differed || category !== "");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!decision || !canSave || saving) return;
    setSaving(true);
    setError("");
    const message = await addJudgment({
      caseId: item.id,
      itemScores: scores,
      myTotal,
      myLevel,
      aiTotal,
      aiLevel,
      finalDecision: decision,
      reasonCategory: differed ? category : "",
      reasonText: text.trim(),
    });
    setSaving(false);
    if (message) {
      setError(message);
      return;
    }
    setSaved(true);
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3 rounded-[14px] border border-line bg-surface p-5">
        <h2 className="text-lg font-semibold">채점 비교</h2>
        <p className="text-sm leading-6 text-muted">
          오른쪽은 사전 생성된 AI 채점입니다. 지금 계산한 값이 아닙니다.
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div
            className={`min-w-0 rounded-xl border px-3.5 py-3 ${levelsDiffer ? "border-accent bg-accent-soft" : "border-line"}`}
          >
            <span className="text-xs text-muted">내 합계</span>
            <p className="mt-1 flex flex-wrap items-baseline gap-2">
              <b className="text-4xl leading-none font-bold tabular-nums">{myTotal}</b>
              <span className="text-sm text-muted">/ 30</span>
              <LevelBadge level={myLevel} />
            </p>
          </div>
          <div
            className={`min-w-0 rounded-xl border px-3.5 py-3 ${levelsDiffer ? "border-accent bg-accent-soft" : "border-line"}`}
          >
            <span className="text-xs text-muted">AI 합계 · 사전 생성된 AI 채점</span>
            <p className="mt-1 flex flex-wrap items-baseline gap-2">
              <b className="text-4xl leading-none font-bold tabular-nums">{aiTotal}</b>
              <span className="text-sm text-muted">/ 30</span>
              <LevelBadge level={aiLevel} />
            </p>
          </div>
        </div>
        {levelsDiffer ? (
          <p className="text-sm font-bold text-accent">내 수준과 AI 수준이 다릅니다.</p>
        ) : (
          <p className="text-sm text-muted">내 수준과 AI 수준이 같습니다.</p>
        )}
        <ul className="flex flex-col gap-2">
          {KORAS_ITEMS.map((question) => {
            const mine = scores[question.no];
            const ai = item.aiScores[question.no];
            const different = mine !== ai;
            const note = item.aiNotes[question.no];
            return (
              <li
                key={question.no}
                className={`flex min-w-0 flex-col gap-1 rounded-[10px] border px-3 py-2.5 text-sm ${different ? "border-accent bg-accent-soft" : "border-line"}`}
              >
                <p className="font-bold">
                  {question.no}. {question.name}
                </p>
                <p>내 채점: {optionLabel(question, mine)} ({mine})</p>
                <p>AI 채점: {optionLabel(question, ai)} ({ai})</p>
                {note ? <p className="leading-6 text-muted">AI 근거: {note}</p> : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-[10px] bg-accent-soft px-3 py-2.5 text-sm leading-6">
        <b className="text-accent">현장 메모</b>
        <p className="text-muted">이 메모는 KORAS-G 문항에 없는 정보입니다.</p>
        <p className="mt-2">
          <b>{item.fieldMemo.tone}</b> · {item.fieldMemo.text}
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-[14px] border border-line bg-surface p-5">
        <h2 className="text-lg font-semibold">최종 판단</h2>
        {saved ? (
          <div className="flex flex-col gap-2.5">
            <p role="status" className="text-sm font-bold text-low">
              기록했습니다.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/analysis"
                className="rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-on-accent"
              >
                분석 보기
              </Link>
              <Link
                href="/"
                className="rounded-[10px] border border-line px-4 py-2 text-sm font-bold"
              >
                사례 목록
              </Link>
            </div>
          </div>
        ) : (
          <form autoComplete="off" onSubmit={onSubmit} className="flex flex-col gap-3">
            <fieldset className="min-w-0">
              <legend className="mb-2 font-bold">도구 수준과 비교한 나의 판단</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {FINAL_DECISIONS.map((choice) => (
                  <label key={choice} className="relative min-w-0">
                    <input
                      type="radio"
                      name="final"
                      value={choice}
                      checked={decision === choice}
                      onChange={() => setDecision(choice)}
                      className="peer absolute inset-0 cursor-pointer opacity-0"
                    />
                    <span className="flex h-full items-center rounded-[10px] border border-line px-3 py-2.5 text-sm font-bold peer-checked:border-accent peer-checked:bg-accent-soft peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                      {choice}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            {differed ? (
              <div className="flex flex-col gap-2.5 border-t border-dashed border-line pt-3.5">
                <p className="text-sm">
                  <b>도구 수준과 다른 판단입니다.</b> 이유 분류를 골라 주세요.
                </p>
                <label className="flex flex-col gap-1 text-sm font-medium text-muted">
                  이유 분류
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="rounded-lg border border-line bg-bg px-2.5 py-2 text-base text-ink"
                  >
                    <option value="">선택하세요</option>
                    {REASON_CATEGORIES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}
            <label className="flex flex-col gap-1 text-sm font-medium text-muted">
              이유 메모 (선택)
              <textarea
                value={text}
                rows={2}
                onChange={(event) => setText(event.target.value)}
                className="min-h-12 resize-y rounded-lg border border-line bg-bg px-2.5 py-2 text-base text-ink"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="submit"
                disabled={!canSave || saving}
                className="rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-on-accent disabled:opacity-40"
              >
                판단 기록하기
              </button>
              <span role="status" className="text-sm font-bold text-accent">
                {error}
              </span>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
