"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { LevelBadge } from "@/components/level-badge";
import {
  decisionLabel,
  differs,
  direction,
  formatStamp,
  REC,
  recordsOf,
} from "@/lib/rules";
import { getDataServerSnapshot, getDataSnapshot, subscribeData } from "@/lib/remote";

export function CaseDetail({ caseId }: { caseId: string }) {
  const data = useSyncExternalStore(subscribeData, getDataSnapshot, getDataServerSnapshot);

  if (data.status === "loading") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <p className="text-sm text-muted">사례를 불러오는 중입니다.</p>
      </div>
    );
  }
  if (data.status !== "ready") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <p className="text-sm leading-6 text-muted">
          {data.status === "error"
            ? data.message
            : "Supabase 주소와 키가 없습니다. .env.local을 넣은 뒤 개발 서버를 다시 실행해 주세요."}
        </p>
      </div>
    );
  }

  const item = data.cases.find((entry) => entry.id === caseId) ?? null;
  const records = recordsOf(data.records, caseId);

  if (!item) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          사례를 찾을 수 없습니다
        </h1>
        <p className="text-base leading-7 text-muted">
          목록에서 다시 선택해 주세요.
        </p>
        <Link
          href="/"
          className="self-start rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-on-accent"
        >
          사례 목록
        </Link>
      </div>
    );
  }

  const tag = item.example
    ? "예시 사례"
    : item.source === "manual"
      ? "직접 추가한 사례"
      : "생성된 가상 사례";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="self-start rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">
            {tag}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            사례 {item.code}
          </h1>
          <p className="text-base leading-7 text-muted">
            {item.age} · 보호관찰 {item.months}개월째
          </p>
        </div>
        <Link
          href={`/cases/${item.id}/record`}
          className="self-start rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-on-accent"
        >
          판단 기록하기
        </Link>
      </div>

      <section className="flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-line bg-surface p-5">
        <h2 className="text-lg font-semibold">평가 결과</h2>
        <p className="flex items-baseline gap-2">
          <b className="text-4xl leading-none font-bold tabular-nums">{item.score}</b>
          <span className="text-sm text-muted">/ 100 · 도구가 낸 종합 점수</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <LevelBadge level={item.level} />
          <span className="text-sm text-muted">
            도구의 권고: {decisionLabel(REC[item.level])}
          </span>
        </div>
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {["평가 항목", "수준", "내용"].map((heading) => (
                  <th
                    key={heading}
                    className="border-b border-line px-1.5 py-2 text-left text-xs font-medium text-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {item.factors.map((factor) => (
                <tr key={factor.key}>
                  <td className="border-b border-line px-1.5 py-2 align-top">
                    {factor.name}
                  </td>
                  <td className="border-b border-line px-1.5 py-2 align-top">
                    <LevelBadge level={factor.lv} />
                  </td>
                  <td className="border-b border-line px-1.5 py-2 align-top">
                    {factor.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-[10px] bg-accent-soft px-3 py-2.5 text-sm leading-6">
          <b className="text-accent">현장 메모 (도구 밖 정보)</b>
          <br />
          {item.memo || "입력된 메모가 없습니다."}
        </div>
      </section>

      <section className="flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-line bg-surface p-5">
        <h2 className="text-lg font-semibold">판단 이력</h2>
        {records.length ? (
          <ul className="flex flex-col gap-2">
            {records.map((record) => {
              const changed = differs(record);
              return (
                <li
                  key={record.id}
                  className="flex flex-col gap-1 rounded-[10px] border border-line px-3 py-2.5 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <b>→ {decisionLabel(record.d)}</b>
                    <span className="text-xs text-muted">
                      {changed
                        ? `권고와 다름 (${direction(record)})`
                        : "권고와 같음"}
                    </span>
                    <span
                      className={
                        record.example
                          ? "rounded border border-line px-1.5 text-[11px] font-bold text-muted"
                          : "rounded border border-accent px-1.5 text-[11px] font-bold text-accent"
                      }
                    >
                      {record.example ? "예시" : "내 기록"}
                    </span>
                    <span className="text-xs text-muted">{formatStamp(record.at)}</span>
                  </div>
                  {changed ? (
                    <p>
                      {record.cat} · {record.txt}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-line px-5 py-5 text-center text-sm text-muted">
            아직 기록이 없습니다. &quot;판단 기록하기&quot;에서 첫 판단을 남겨
            보세요.
          </p>
        )}
      </section>
    </div>
  );
}
