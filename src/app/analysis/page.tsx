import type { Metadata } from "next";
import { AnalysisView } from "@/components/analysis-view";
import { Screen } from "@/components/screen";

export const metadata: Metadata = { title: "갈림 분석" };

export default function AnalysisPage() {
  return (
    <Screen
      title="채점과 판단이 갈린 곳"
      lede="내가 고른 답과 기준 채점이 어느 문항에서 달랐는지, 도구 수준과 다르게 판단한 이유가 무엇인지 모아 봅니다."
    >
      <AnalysisView />
    </Screen>
  );
}
