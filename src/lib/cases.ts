"use client";

import { useSyncExternalStore } from "react";
import { buildValidatedCase, validateGeneratedCase } from "@/lib/case-rules";
import { DEMO_CASES, type DemoCase } from "@/lib/koras";

const STORAGE_KEY = "galim-generated-cases-v2";
const AUTO_COUNT = 3;

let generated: DemoCase[] = [];
let seeded = false;
let loaded = false;
let list: DemoCase[] | null = null;
const listeners = new Set<() => void>();
const demoIds = new Set(DEMO_CASES.map((item) => item.id));

function notify() {
  listeners.forEach((listener) => listener());
}

function isStoredCase(value: unknown): value is DemoCase {
  if (!value || typeof value !== "object") return false;
  const item = value as DemoCase;
  return typeof item.id === "string" && Array.isArray(item.record) && !!item.aiScores && !!item.fieldMemo;
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { seeded?: boolean; cases?: unknown[] };
    if (Array.isArray(parsed.cases)) {
      generated = parsed.cases.filter(isStoredCase).filter((item) => validateGeneratedCase(item).ok);
    }
    seeded = parsed.seeded === true && generated.length > 0;
  } catch {
    generated = [];
    seeded = false;
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ seeded, cases: generated }));
  } catch {
    // 저장 공간이 없으면 이번 화면의 메모리 목록만 유지한다.
  }
}

function nextId(extra: DemoCase[] = []) {
  const used = [...generated, ...extra, ...DEMO_CASES].map((item) => Number(item.id.slice(2)));
  const max = used.reduce((highest, value) => (Number.isFinite(value) ? Math.max(highest, value) : highest), 0);
  return `K-${String(max + 1).padStart(3, "0")}`;
}

function shuffle(items: DemoCase[]) {
  const next = items.slice();
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swap];
    next[swap] = current;
  }
  return next;
}

function createCases(count: number) {
  const made: DemoCase[] = [];
  for (let index = 0; index < count; index += 1) made.push(buildValidatedCase(nextId(made)));
  return made;
}

function ensure() {
  if (typeof window === "undefined") return;
  load();
  if (seeded) return;
  generated = [...createCases(AUTO_COUNT), ...generated];
  seeded = true;
  list = null;
  persist();
}

function casesNow() {
  ensure();
  if (!list) list = shuffle([...generated, ...DEMO_CASES]);
  return list;
}

export function isGeneratedCase(id: string) {
  return !demoIds.has(id);
}

export function subscribeCases(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) list = null;
  };
}

export function getCaseList() {
  return casesNow();
}

export function getCaseListServer(): DemoCase[] | null {
  return null;
}

export function findCase(id: string) {
  ensure();
  return generated.find((item) => item.id === id) ?? DEMO_CASES.find((item) => item.id === id) ?? null;
}

export function addGenerated(count: number) {
  ensure();
  const made = createCases(count);
  generated = [...made, ...generated];
  list = list ? [...made, ...list] : null;
  persist();
  notify();
  return made;
}

export function useCaseRecord(caseId: string) {
  return useSyncExternalStore(
    subscribeCases,
    () => findCase(caseId),
    () => DEMO_CASES.find((entry) => entry.id === caseId) ?? undefined,
  );
}
