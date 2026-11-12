"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { addGenerated, getCaseList, getCaseListServer, isGeneratedCase, subscribeCases } from "@/lib/cases";
import type { DemoCase } from "@/lib/koras";
import { EXAMPLE_MARK, GENERATED_MARK, VIRTUAL_CASE } from "@/lib/copy";
import { differsFromTool } from "@/lib/judgment";
import { getDataServerSnapshot, getDataSnapshot, subscribeData } from "@/lib/remote";

type Filter = "all" | "pending" | "done";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "기록 대기" },
  { key: "done", label: "기록 완료" },
];

function line(item: DemoCase, label: string) {
  return item.record.find((row) => row.label === label)?.value ?? item.record[0]?.value ?? "";
}

export function CaseList() {
  const cases = useSyncExternalStore(subscribeCases, getCaseList, getCaseListServer);
  const data = useSyncExternalStore(subscribeData, getDataSnapshot, getDataServerSnapshot);
  const [filter, setFilter] = useState<Filter>("all");

  if (!cases) {
    return <p className="text-sm text-muted">사례를 준비하는 중입니다.</p>;
  }

  const judgments = data.status === "ready" ? data.judgments : [];
  const counts: Record<string, number> = {};
  judgments.forEach((row) => {
    counts[row.caseId] = (counts[row.caseId] || 0) + 1;
  });
  const pending = cases.filter((item) => !counts[item.id]);
  const differed = judgments.filter((row) => differsFromTool(row.finalDecision)).length;
  const ratio = judgments.length ? `${Math.round((differed / judgments.length) * 100)}%` : "0%";
  const visible = cases.filter((item) => {
    if (filter === "pending") return !counts[item.id];
    if (filter === "done") return !!counts[item.id];
    return true;
  });
  const stats = [
    [String(cases.length), "전체 사례"],
    [String(pending.length), "기록 대기"],
    [data.status === "ready" ? String(judgments.length) : "–", "판단 기록"],
    [data.status === "ready" ? ratio : "–", "도구와 달랐던 비율"],
  ];

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm leading-6 text-muted">{VIRTUAL_CASE}</p>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label} className="min-w-0 rounded-xl border border-line bg-surface px-3.5 py-3">
            <b className="block text-2xl leading-tight font-bold text-ink tabular-nums">{value}</b>
            <span className="text-xs leading-5 text-muted">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="사례 필터">
          {FILTERS.map((item) => {
            const pressed = filter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={pressed}
                onClick={() => setFilter(item.key)}
                className={
                  pressed
                    ? "rounded-full border border-ink bg-ink px-3.5 py-1.5 text-sm font-medium text-bg"
                    : "rounded-full border border-line bg-transparent px-3.5 py-1.5 text-sm font-medium text-ink hover:bg-accent-soft"
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              addGenerated(1);
              setFilter("all");
            }}
            className="rounded-[10px] bg-accent px-3.5 py-1.5 text-sm font-bold text-on-accent"
          >
            새 사례 1개 생성
          </button>
          <button
            type="button"
            onClick={() => {
              addGenerated(5);
              setFilter("all");
            }}
            className="rounded-[10px] border border-line bg-surface px-3.5 py-1.5 text-sm font-bold"
          >
            새 사례 5개 생성
          </button>
        </div>
      </div>
      {visible.length ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {visible.map((item) => (
            <Link
              key={item.id}
              href={`/cases/${item.id}`}
              className="flex min-w-0 flex-col gap-2 rounded-[14px] border border-line bg-surface p-4 hover:border-accent"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <b className="text-base">사례 {item.id}</b>
                <span className="text-[11px] leading-4 font-bold text-muted">
                  {isGeneratedCase(item.id) ? GENERATED_MARK : EXAMPLE_MARK}
                </span>
              </div>
              <p className="text-sm text-muted">{line(item, "나이·학력·혼인")}</p>
              <p className="text-sm leading-6">{line(item, "본 범행")}</p>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                <span>{counts[item.id] ? `기록 ${counts[item.id]}건` : "기록 대기"}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line px-5 py-5 text-center text-sm text-muted">
          조건에 맞는 사례가 없습니다.
        </p>
      )}
    </div>
  );
}
