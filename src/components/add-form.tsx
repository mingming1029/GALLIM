"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import { LevelBadge } from "@/components/level-badge";
import {
  FACTORS,
  OUTSIDE,
  REC,
  decisionLabel,
  levelOf,
  scoreOf,
  type Level,
  type MemoDir,
} from "@/lib/rules";
import { addManual, getDataServerSnapshot, getDataSnapshot, subscribeData } from "@/lib/remote";

const AGES = ["20대", "30대", "40대", "50대"] as const;
const DIRECTIONS: readonly { value: MemoDir; label: string }[] = [
  { value: "neu", label: "특별한 변화 없음" },
  { value: "pos", label: "좋아진 쪽" },
  { value: "neg", label: "나빠진 쪽" },
];

const fieldClass =
  "w-full min-w-0 rounded-lg border border-line bg-bg px-2.5 py-2 text-base text-ink";

export function AddForm() {
  const data = useSyncExternalStore(subscribeData, getDataSnapshot, getDataServerSnapshot);
  const router = useRouter();
  const [age, setAge] = useState<(typeof AGES)[number]>("20대");
  const [months, setMonths] = useState("3");
  const [levels, setLevels] = useState<Level[]>(() => FACTORS.map(() => "low"));
  const [memo, setMemo] = useState("");
  const [memoDir, setMemoDir] = useState<MemoDir>("neu");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const score = useMemo(() => scoreOf(levels), [levels]);
  const level = levelOf(score);

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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    const parsed = Number.parseInt(months, 10);
    const clamped = Math.max(1, Math.min(36, Number.isFinite(parsed) ? parsed : 1));
    const text = memo.trim().slice(0, 80);
    const created = await addManual(
      levels,
      age,
      clamped,
      text ? { t: text, dir: memoDir, cat: OUTSIDE } : null,
    );
    if (!created) {
      setSaving(false);
      setError("사례를 저장하지 못했습니다.");
      return;
    }
    router.push(`/cases/${created.id}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <div className="flex flex-col gap-2">
        <span className="self-start rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent">
          직접 만들기
        </span>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">사례 추가</h1>
        <p className="text-base leading-7">
          직접 가상 사례를 입력합니다. 점수와 위험 수준은 항목에 따라 자동으로
          계산됩니다. 실제 사람이나 실제 사건의 정보는 넣지 마세요.
        </p>
      </div>
      <section className="rounded-[14px] border border-line bg-surface p-5">
        <form autoComplete="off" onSubmit={onSubmit} className="flex flex-col gap-2.5">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-muted">
              연령대
              <select
                value={age}
                onChange={(event) => setAge(event.target.value as (typeof AGES)[number])}
                className={fieldClass}
              >
                {AGES.map((band) => (
                  <option key={band} value={band}>
                    {band}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-muted">
              보호관찰 기간(개월)
              <input
                type="number"
                min={1}
                max={36}
                value={months}
                onChange={(event) => setMonths(event.target.value)}
                className={fieldClass}
              />
            </label>
          </div>
          {FACTORS.map((factor, index) => (
            <label
              key={factor.key}
              className="flex min-w-0 flex-col gap-1 text-sm font-medium text-muted"
            >
              {factor.name}
              <select
                value={levels[index]}
                onChange={(event) => {
                  const next = levels.slice();
                  next[index] = event.target.value as Level;
                  setLevels(next);
                }}
                className={fieldClass}
              >
                {factor.opts.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-muted">
            현장 메모 (도구 밖 정보, 선택)
            <textarea
              value={memo}
              maxLength={80}
              rows={2}
              placeholder="예: 평가 이후 두 달째 같은 곳에서 일하고 있음"
              onChange={(event) => setMemo(event.target.value)}
              className={`${fieldClass} min-h-12 resize-y`}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-muted">
            메모의 방향
            <select
              value={memoDir}
              onChange={(event) => setMemoDir(event.target.value as MemoDir)}
              className={fieldClass}
            >
              {DIRECTIONS.map((direction) => (
                <option key={direction.value} value={direction.value}>
                  {direction.label}
                </option>
              ))}
            </select>
          </label>
          <p className="flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
            <b>계산된 점수 {score}</b>
            <LevelBadge level={level} />
            <span className="text-muted">도구의 권고: {decisionLabel(REC[level])}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="submit"
              disabled={saving}
              className="rounded-[10px] bg-accent px-4 py-2 text-sm font-bold text-on-accent disabled:opacity-40"
            >
              사례 추가
            </button>
            <span role="status" aria-live="polite" className="text-sm font-bold text-accent">
              {error || data.notice || ""}
            </span>
          </div>
        </form>
      </section>
    </div>
  );
}
