"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { LevelBadge } from "@/components/level-badge";
import {
  CATS,
  decisionLabel,
  differs,
  direction,
  type DecisionKey,
  type Level,
} from "@/lib/rules";
import { getDataServerSnapshot, getDataSnapshot, subscribeData } from "@/lib/remote";

const LEVELS: Level[] = ["high", "mid", "low"];
const DECISION_KEYS: DecisionKey[] = ["up", "keep", "down"];

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

  const records = data.records;
  const diffs = records.filter(differs);
  const softer = diffs.filter((record) => direction(record) === "완화").length;
  const counts = CATS.map(
    (name) => [name, diffs.filter((record) => record.cat === name).length] as const,
  );
  const max = Math.max(...counts.map((entry) => entry[1]), 1);
  const top = counts.slice().sort((a, b) => b[1] - a[1])[0];
  const recent = diffs.slice().sort((a, b) => (b.at < a.at ? -1 : 1)).slice(0, 6);
  const stats = [
    [String(records.length), "전체 기록"],
    [String(diffs.length), "권고와 달랐던 결정"],
    [records.length ? Math.round((diffs.length / records.length) * 100) + "%" : "0%", "갈린 비율"],
    [String(softer), "도구보다 완화"],
    [String(diffs.length - softer), "도구보다 강화"],
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {stats.map(([value, label]) => (
          <div key={label} className="min-w-0 rounded-xl border border-line bg-surface px-3.5 py-3">
            <b className="block text-2xl leading-tight font-bold tabular-nums">{value}</b>
            <span className="text-xs leading-5 text-muted">{label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold">이유의 종류별 건수</h2>
          <div className="flex flex-col gap-2">
            {counts.map(([name, count]) => (
              <div
                key={name}
                className="grid grid-cols-[6rem_minmax(0,1fr)_1.75rem] items-center gap-2 text-sm sm:grid-cols-[8.25rem_minmax(0,1fr)_1.75rem]"
              >
                <span className="min-w-0 leading-5">{name}</span>
                <span className="h-2.5 rounded-full bg-bg">
                  <i
                    className="block h-2.5 min-w-0.5 rounded-full bg-accent"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </span>
                <em className="text-right text-sm text-muted tabular-nums not-italic">{count}</em>
              </div>
            ))}
          </div>
          <p className="border-l-[3px] border-accent pl-3 text-sm leading-6">
            {top[1] > 0
              ? `권고와 달랐던 ${diffs.length}건 중 가장 많은 이유는 "${top[0]}"(${top[1]}건)입니다. 도구가 놓치고 있는 정보이거나, 평가 항목을 다시 볼 후보일 수 있습니다.`
              : "아직 권고와 다른 결정이 없습니다. 사례를 열어 판단을 기록해 보세요."}
          </p>
        </section>
        <section className="flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold">위험 수준별 결정</h2>
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {["도구의 수준", "강화", "유지", "완화", "권고와 다른 비율"].map((heading) => (
                    <th
                      key={heading}
                      className="border-b border-line px-1.5 py-2 text-left text-xs font-medium whitespace-nowrap text-muted"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LEVELS.map((level) => {
                  const rows = records.filter((record) => record.lv === level);
                  const rate = rows.length
                    ? Math.round((rows.filter(differs).length / rows.length) * 100) + "%"
                    : "-";
                  return (
                    <tr key={level}>
                      <td className="border-b border-line px-1.5 py-2">
                        <LevelBadge level={level} />
                      </td>
                      {DECISION_KEYS.map((key) => (
                        <td key={key} className="border-b border-line px-1.5 py-2 tabular-nums">
                          {rows.filter((record) => record.d === key).length}
                        </td>
                      ))}
                      <td className="border-b border-line px-1.5 py-2 tabular-nums">{rate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <h2 className="text-lg font-semibold">최근 달랐던 결정</h2>
          {recent.length ? (
            <ul className="flex flex-col gap-2">
              {recent.map((record) => {
                const code =
                  data.cases.find((item) => item.id === record.caseId)?.code ?? record.caseId;
                return (
                  <li
                    key={record.id}
                    className="flex flex-col gap-1 rounded-[10px] border border-line px-3 py-2.5 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/cases/${record.caseId}`} className="font-bold">
                        사례 {code}
                      </Link>
                      <LevelBadge level={record.lv} />
                      <span>
                        → {decisionLabel(record.d)} ({direction(record)})
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
                    </div>
                    <p>
                      {record.cat} · {record.txt}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-line px-5 py-5 text-center text-sm text-muted">
              아직 없습니다.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
