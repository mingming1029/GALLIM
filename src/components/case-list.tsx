"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { LevelBadge } from "@/components/level-badge";
import { differs, sortedCases } from "@/lib/rules";
import {
  addCases,
  getDataServerSnapshot,
  getDataSnapshot,
  subscribeData,
} from "@/lib/remote";

type Filter = "all" | "pending" | "done";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "기록 대기" },
  { key: "done", label: "기록 완료" },
];

export function CaseList() {
  const data = useSyncExternalStore(subscribeData, getDataSnapshot, getDataServerSnapshot);
  const [filter, setFilter] = useState<Filter>("all");
  const [saving, setSaving] = useState(false);

  if (data.status === "loading") {
    return <p className="text-sm text-muted">사례를 불러오는 중입니다.</p>;
  }
  if (data.status === "unconfigured") {
    return (
      <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-6 text-muted">
        Supabase 주소와 키가 없습니다. 프로젝트 폴더의 .env.local에
        NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 넣고 개발
        서버를 다시 실행해 주세요. secret 키는 넣지 않습니다.
      </p>
    );
  }
  if (data.status === "error") {
    return (
      <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-6 text-muted">
        {data.message}
      </p>
    );
  }

  const store = data;

  const cases = sortedCases(store.cases);
  const counts: Record<string, number> = {};
  store.records.forEach((record) => {
    counts[record.caseId] = (counts[record.caseId] || 0) + 1;
  });
  const pending = cases.filter((item) => !counts[item.id]);
  const differed = store.records.filter(differs).length;
  const ratio = store.records.length
    ? Math.round((differed / store.records.length) * 100) + "%"
    : "0%";
  const visible = cases.filter((item) => {
    if (filter === "pending") return !counts[item.id];
    if (filter === "done") return !!counts[item.id];
    return true;
  });

  const stats = [
    [String(cases.length), "전체 사례"],
    [String(pending.length), "판단 기록 대기"],
    [String(store.records.length), "판단 기록"],
    [ratio, "권고와 달랐던 비율"],
  ];

  function generate(count: number) {
    setSaving(true);
    setFilter("all");
    void addCases(count).finally(() => setSaving(false));
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map(([value, label]) => (
          <div
            key={label}
            className="min-w-0 rounded-xl border border-line bg-surface px-3.5 py-3"
          >
            <b className="block text-2xl leading-tight font-bold tabular-nums text-ink">
              {value}
            </b>
            <span className="text-xs leading-5 text-muted">{label}</span>
          </div>
        ))}
      </div>

      {store.notice ? (
        <p className="rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-6 text-muted">
          {store.notice}
        </p>
      ) : null}

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
            onClick={() => generate(1)}
            disabled={saving}
            className="rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-on-accent disabled:opacity-50"
          >
            새 사례 1개 생성
          </button>
          <button
            type="button"
            onClick={() => generate(5)}
            disabled={saving}
            className="rounded-[10px] border border-line bg-transparent px-4 py-2 text-sm font-bold text-ink disabled:opacity-50"
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
              <div className="flex items-center justify-between gap-2">
                <b className="text-base">사례 {item.code}</b>
                <LevelBadge level={item.level} />
              </div>
              <p className="text-sm text-muted">
                {item.age} · 보호관찰 {item.months}개월째
              </p>
              <p className="text-[28px] leading-none font-bold tabular-nums">
                {item.score}
                <small className="ml-1 text-xs font-normal text-muted">/ 100</small>
              </p>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
                <span>
                  {counts[item.id] ? `기록 ${counts[item.id]}건` : "기록 대기"}
                </span>
                {item.example ? (
                  <span className="rounded border border-line px-1.5 font-bold">
                    예시
                  </span>
                ) : item.source === "manual" ? (
                  <span className="rounded border border-accent px-1.5 font-bold text-accent">
                    직접 추가
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-line px-5 py-5 text-center text-sm text-muted">
          조건에 맞는 사례가 없습니다. 위의 &quot;새 사례 생성&quot;을 눌러 보세요.
        </p>
      )}
    </div>
  );
}
