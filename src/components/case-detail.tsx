"use client";

import Link from "next/link";
import { isGeneratedCase, useCaseRecord } from "@/lib/cases";
import { EXAMPLE_MARK, GENERATED_MARK, VIRTUAL_CASE } from "@/lib/copy";

export function CaseDetail({ caseId }: { caseId: string }) {
  const item = useCaseRecord(caseId);

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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="self-start rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">
            {isGeneratedCase(item.id) ? GENERATED_MARK : EXAMPLE_MARK}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">사례 {item.id}</h1>
          <p className="text-sm leading-6 text-muted">{VIRTUAL_CASE}</p>
        </div>
        <Link
          href={`/cases/${item.id}/record`}
          className="self-start rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-on-accent"
        >
          채점하기
        </Link>
      </div>
      <section className="flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-line bg-surface p-5">
        <h2 className="text-lg font-semibold">사건기록</h2>
        <div className="min-w-0 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {["항목", "내용"].map((heading) => (
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
              {item.record.map((row) => (
                <tr key={row.label}>
                  <td className="border-b border-line px-1.5 py-2 align-top whitespace-nowrap">
                    {row.label}
                  </td>
                  <td className="border-b border-line px-1.5 py-2 align-top leading-6">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
