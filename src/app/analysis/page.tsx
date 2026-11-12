import type { Metadata } from "next";
import { AnalysisView } from "@/components/analysis-view";
import { Screen } from "@/components/screen";

export const metadata: Metadata = { title: "갈림 분석" };

export default function AnalysisPage() {
  return (
    <Screen
      title="점수와 결정이 갈린 곳"
      lede="도구의 권고와 다르게 내린 판단이 어떤 이유에서 나왔는지 모아 봅니다. 예시 기록과 내 기록이 함께 집계됩니다."
    >
      <AnalysisView />
    </Screen>
  );
}
