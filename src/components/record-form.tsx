"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { LevelBadge } from "@/components/level-badge";
import {
  CATS,
  DECISIONS,
  REC,
  decisionLabel,
  pendingCases,
  type DecisionKey,
} from "@/lib/rules";
import {
  addCases,
  addRecord,
  getDataServerSnapshot,
  getDataSnapshot,
  subscribeData,
} from "@/lib/remote";

export function RecordForm({ caseId }: { caseId: string }) {
  const data = useSyncExternalStore(subscribeData, getDataSnapshot, getDataServerSnapshot);
  const router = useRouter();
  const [picked, setPicked] = useState<DecisionKey | null>(null);
  const [category, setCategory] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<boolean | null>(null);
  const [making, setMaking] = useState(false);

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

  const differed = picked !== null && picked !== REC[item.level];
  const canSave =
    picked !== null && (!differed || (category !== "" && text.trim() !== ""));
  const waiting = pendingCases(data.cases, data.records);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item || !picked || !canSave || saving) return;
    setSaving(true);
    setError("");
    const message = await addRecord(
      item,
      picked,
      differed ? category : "",
      differed ? text.trim() : "",
    );
    setSaving(false);
    if (message) {
      setError(message);
      return;
    }
    setSaved(differed);
  }

  async function makeNext() {
    setMaking(true);
    const created = await addCases(1);
    const next = created?.[0];
    if (next) router.push(`/cases/${next.id}/record`);
    else setMaking(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <div className="flex flex-col gap-2">
        <span className="self-start rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">
          판단 기록
        </span>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          사례 {item.code}에 대한 나의 판단
        </h1>
      </div>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-3.5 rounded-[14px] border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold">평가 결과 요약</h2>
          <p className="flex flex-wrap items-baseline gap-2">
            <b className="text-4xl leading-none font-bold tabular-nums">{item.score}</b>
            <span className="text-sm text-muted">
              / 100 · 도구의 권고: {decisionLabel(REC[item.level])}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <LevelBadge level={item.level} />
            <span className="text-sm text-muted">
              {item.age} · 보호관찰 {item.months}개월째
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
                    <td className="border-b border-line px-1.5 py-2 align-top">{factor.name}</td>
                    <td className="border-b border-line px-1.5 py-2 align-top">
                      <LevelBadge level={factor.lv} />
                    </td>
                    <td className="border-b border-line px-1.5 py-2 align-top">{factor.note}</td>
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
          <h2 className="text-lg font-semibold">결정 입력</h2>
          {saved === null ? (
            <form autoComplete="off" onSubmit={onSubmit} className="flex flex-col gap-3.5">
              <fieldset className="min-w-0">
                <legend className="mb-2 font-bold">담당자의 결정</legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {DECISIONS.map((choice) => (
                    <label key={choice.key} className="relative">
                      <input
                        type="radio"
                        name="decision"
                        value={choice.key}
                        checked={picked === choice.key}
                        onChange={() => setPicked(choice.key)}
                        className="peer absolute inset-0 cursor-pointer opacity-0"
                      />
                      <span className="flex flex-col gap-0.5 rounded-[10px] border border-line px-3 py-2.5 text-sm font-bold peer-checked:border-accent peer-checked:bg-accent-soft peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                        {choice.label}
                        <small className="text-xs font-normal text-muted">{choice.hint}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div
                className={
                  differed
                    ? "flex flex-col gap-2.5 border-t border-dashed border-line pt-3.5"
                    : "hidden"
                }
              >
                <p className="text-sm">
                  <b>도구의 권고와 다른 결정입니다.</b> 이유를 남겨 주세요.
                </p>
                <label className="flex flex-col gap-1 text-sm font-medium text-muted">
                  이유의 종류
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="rounded-lg border border-line bg-bg px-2.5 py-2 text-base text-ink"
                  >
                    <option value="">선택하세요</option>
                    {CATS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-muted">
                  한 줄 설명 (60자 이내)
                  <textarea
                    value={text}
                    maxLength={60}
                    rows={2}
                    placeholder="예: 최근 3개월간 일을 계속 나가고 있음"
                    onChange={(event) => setText(event.target.value)}
                    className="min-h-12 resize-y rounded-lg border border-line bg-bg px-2.5 py-2 text-base text-ink"
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="submit"
                  disabled={!canSave || saving}
                  className="rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-on-accent disabled:opacity-40"
                >
                  판단 기록하기
                </button>
                <span role="status" aria-live="polite" className="text-sm font-bold text-accent">
                  {error}
                </span>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-2.5">
              <p role="status" className="text-sm font-bold text-low">
                기록했습니다.{" "}
                {saved
                  ? "권고와 달랐던 판단으로 분석에 반영됩니다."
                  : "권고와 같은 판단으로 기록되었습니다."}
              </p>
              <div className="flex flex-wrap gap-2">
                {waiting[0] ? (
                  <Link
                    href={`/cases/${waiting[0].id}/record`}
                    className="rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-on-accent"
                  >
                    다음 기록 대기 사례 ({waiting[0].code})
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => void makeNext()}
                  disabled={making}
                  className="rounded-[10px] border border-line px-4 py-2 text-sm font-bold disabled:opacity-40"
                >
                  새 사례를 만들어 이어서
                </button>
                <Link
                  href="/analysis"
                  className="rounded-[10px] border border-line px-4 py-2 text-sm font-bold"
                >
                  분석 보기
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
