"use client";

import Link from "next/link";
import { useState } from "react";
import { CompareForm } from "@/components/compare-form";
import { LevelBadge } from "@/components/level-badge";
import { KORAS_ITEMS, MAX_SCORE, levelOf, totalOf, type DemoCase } from "@/lib/koras";
import { useCaseRecord } from "@/lib/cases";

function CaseRecordPanel({ item }: { item: DemoCase }) {
  return (
    <aside className="sticky top-0 z-10 max-h-[40vh] overflow-y-auto overscroll-contain rounded-[14px] border border-line bg-surface p-4 shadow-[0_10px_18px_-14px_rgba(28,25,22,0.45)] lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:p-5 lg:shadow-none">
      <h2 className="text-base font-semibold">사건기록</h2>
      <p className="mt-1 text-xs leading-5 text-muted">
        사례 {item.id}. 채점하는 동안 이 기록을 함께 볼 수 있습니다.
      </p>
      <dl className="mt-3 flex flex-col gap-3">
        {item.record.map((row) => (
          <div key={row.label} className="min-w-0 border-b border-line pb-3 last:border-b-0 last:pb-0">
            <dt className="text-xs font-bold text-muted">{row.label}</dt>
            <dd className="mt-1 text-sm leading-6">{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

export function ScoreForm({ caseId }: { caseId: string }) {
  const item = useCaseRecord(caseId);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (item === undefined) {
    return <p className="px-4 py-6 text-sm text-muted">사례를 불러오는 중입니다.</p>;
  }

  if (!item) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">사례를 찾을 수 없습니다</h1>
        <Link
          href="/"
          className="self-start rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-on-accent"
        >
          사례 목록
        </Link>
      </div>
    );
  }

  const answered = KORAS_ITEMS.filter((question) =>
    Object.prototype.hasOwnProperty.call(scores, question.no),
  ).length;
  const total = totalOf(scores);
  const level = levelOf(total);
  const complete = answered === KORAS_ITEMS.length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6">
      <div className="flex flex-col gap-2">
        <span className="self-start rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">
          채점
        </span>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          사례 {item.id} 채점
        </h1>
        <p className="text-sm leading-6 text-muted">
          KORAS-G 17문항입니다. 만점 {MAX_SCORE}점, 0~6 낮음, 7~11 중간, 12 이상 높음. 핸드폰에서는
          사건기록이 위에, 넓은 화면에서는 옆에 남아 있습니다.
        </p>
      </div>

      {submitted ? (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
          <CaseRecordPanel item={item} />
          <CompareForm item={item} scores={scores} />
        </div>
      ) : (
        <form
          autoComplete="off"
          className="grid items-start gap-4 lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] lg:gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (complete) setSubmitted(true);
          }}
        >
          <CaseRecordPanel item={item} />
          <div className="flex min-w-0 flex-col gap-4">
          {KORAS_ITEMS.map((question) => (
            <fieldset
              key={question.no}
              className="min-w-0 rounded-[14px] border border-line bg-surface p-4"
            >
              <legend className="px-1 text-sm font-bold">
                {question.no}. {question.name}
              </legend>
              <details className="mb-2 text-sm">
                <summary className="cursor-pointer text-muted">매뉴얼 보기</summary>
                <p className="mt-1 leading-6 text-muted">{question.help}</p>
              </details>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {question.options.map((option) => {
                  const selected =
                    Object.prototype.hasOwnProperty.call(scores, question.no) &&
                    scores[question.no] === option.score;
                  return (
                    <label key={option.label} className="relative min-w-0">
                      <input
                        type="radio"
                        name={`item-${question.no}`}
                        checked={selected}
                        onChange={() =>
                          setScores((current) => ({ ...current, [question.no]: option.score }))
                        }
                        className="peer absolute inset-0 cursor-pointer opacity-0"
                      />
                      <span className="flex min-h-full flex-col gap-0.5 rounded-[10px] border border-line px-3 py-2.5 text-sm font-bold peer-checked:border-accent peer-checked:bg-accent-soft peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                        {option.label}
                        <small className="text-xs font-normal text-muted">{option.score}점</small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
          <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-line bg-surface p-4">
            <p className="flex flex-wrap items-baseline gap-2" aria-live="polite">
              <b className="text-4xl leading-none font-bold tabular-nums">{total}</b>
              <span className="text-sm text-muted">/ {MAX_SCORE}</span>
              <LevelBadge level={level} />
              <span className="text-sm text-muted">{answered}/17문항</span>
            </p>
            <button
              type="submit"
              disabled={!complete}
              className="self-start rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-on-accent disabled:opacity-40"
            >
              채점 제출
            </button>
          </div>
          </div>
        </form>
      )}
    </div>
  );
}
