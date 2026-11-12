"use client";

import { useSyncExternalStore } from "react";
import { DEMO_CASES, KORAS_ITEMS } from "@/lib/koras";
import { REASON_CATEGORIES, differsFromTool } from "@/lib/judgment";
import { getDataServerSnapshot, getDataSnapshot, subscribeData } from "@/lib/remote";

export function AnalysisView() {
  const data = useSyncExternalStore(subscribeData, getDataSnapshot, getDataServerSnapshot);

  if (data.status === "loading") {
    return <p className="text-sm text-muted">기록을 불러오는 중입니다.</p>;
  }
  if (data.status !== "ready") {
    return (
      <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-6 text-muted">
        {data.status === "error"
          ? data.message
          : "Supabase 주소와 키가 없습니다. .env.local을 넣은 뒤 개발 서버를 다시 실행해 주세요."}
      </p>
    );
  }

  const rows = data.judgments;
  const differed = rows.filter((row) => differsFromTool(row.finalDecision));
  const ratio = rows.length ? Math.round((differed.length / rows.length) * 100) : 0;
  const counts = KORAS_ITEMS.map((question) => {
    const count = rows.filter((row) => {
      const demo = DEMO_CASES.find((item) => item.id === row.caseId);
      if (!demo) return false;
      return row.itemScores[question.no] !== demo.aiScores[question.no];
    }).length;
    return { question, count };
  });
  const max = Math.max(...counts.map((entry) => entry.count), 1);
  const top = counts.slice().sort((a, b) => b.count - a.count || a.question.no - b.question.no)[0];
  const reasonCounts = REASON_CATEGORIES.map((name) => ({
    name,
    count: differed.filter((row) => row.reasonCategory === name).length,
  }));
  const reasonMax = Math.max(...reasonCounts.map((entry) => entry.count), 1);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="min-w-0 rounded-xl border border-line bg-surface px-3.5 py-3">
          <b className="block text-2xl leading-tight font-bold tabular-nums">{rows.length}</b>
          <span className="text-xs leading-5 text-muted">내가 기록한 판단</span>
        </div>
        <div className="min-w-0 rounded-xl border border-line bg-surface px-3.5 py-3">
          <b className="block text-2xl leading-tight font-bold tabular-nums">{ratio}%</b>
          <span className="text-xs leading-5 text-muted">도구 수준과 다르게 판단한 비율</span>
        </div>
      </div>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
      <section className="flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-line bg-surface p-5">
        <h2 className="text-lg font-semibold">문항별 차이</h2>
        <p className="text-sm leading-6 text-muted">AI 채점과 내 채점이 달랐던 횟수입니다.</p>
        <div className="flex flex-col gap-2">
          {counts.map(({ question, count }) => (
            <div
              key={question.no}
              className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)_1.75rem] items-center gap-2 text-sm"
            >
              <span className="min-w-0 leading-5">
                {question.no}. {question.name}
              </span>
              <span className="h-2.5 rounded-full bg-bg">
                <i
                  className="block h-2.5 min-w-0.5 rounded-full bg-accent"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </span>
              <em className="text-right tabular-nums text-muted not-italic">{count}</em>
            </div>
          ))}
        </div>
        <p className="border-l-[3px] border-accent pl-3 text-sm leading-6">
          {rows.length < 3
            ? "기록이 적어서 경향을 말하기 어렵다."
            : top.count > 0
              ? `문항 ${top.question.no} ${top.question.name}에서 가장 많이 갈렸습니다 (${top.count}건).`
              : "AI 채점과 다른 문항이 아직 없습니다."}
        </p>
      </section>
      <section className="flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-line bg-surface p-5">
        <h2 className="text-lg font-semibold">이유 분류</h2>
        <p className="text-sm leading-6 text-muted">도구 수준과 다르게 판단한 기록만 모았습니다.</p>
        {differed.length ? (
          <div className="flex flex-col gap-2">
            {reasonCounts.map((entry) => (
              <div
                key={entry.name}
                className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)_1.75rem] items-center gap-2 text-sm"
              >
                <span className="min-w-0 leading-5">{entry.name}</span>
                <span className="h-2.5 rounded-full bg-bg">
                  <i
                    className="block h-2.5 min-w-0.5 rounded-full bg-accent"
                    style={{ width: `${(entry.count / reasonMax) * 100}%` }}
                  />
                </span>
                <em className="text-right tabular-nums text-muted not-italic">{entry.count}</em>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">도구 수준과 다르게 판단한 기록이 없습니다.</p>
        )}
      </section>
      </div>
    </div>
  );
}
