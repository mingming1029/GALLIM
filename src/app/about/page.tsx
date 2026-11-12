import type { Metadata } from "next";
import { Screen } from "@/components/screen";
import { DISCLAIMER } from "@/lib/copy";

export const metadata: Metadata = { title: "소개" };

const SECTIONS = [
  [
    "문제의식",
    "위험성 평가 도구가 있어도, 그 결과가 처우를 정하는 판단에 얼마나 반영되는지는 별개의 문제입니다. 사람이 도구의 결과와 다르게 판단해도, 왜 그랬는지는 대개 남지 않습니다.",
  ],
  [
    "아이디어",
    "도구의 결과와 다른 판단을 할 때만 이유를 한 줄 남기게 합니다. 이유가 쌓이면 도구가 놓치는 정보와 평가 항목을 다시 볼 후보가 보입니다. 도구를 따르라는 것도, 무시하라는 것도 아닙니다.",
  ],
  [
    "한계",
    "모든 사례는 무작위로 만든 가상 데이터이고, 점수 계산도 이 시제품을 위해 단순하게 정한 규칙입니다. 실제 평가 도구와 관계가 없고, 현장에서 검증하지 않았습니다. 효과가 있다고 말할 수 없습니다.",
  ],
  [
    "데이터 처리",
    "앱을 열면 이름 없이 익명으로 한 번 로그인합니다. 직접 만든 사례와 판단 기록은 Supabase에 저장되고, 그 기록을 만든 방문자만 읽고 쓸 수 있습니다. 예시 사례와 예시 기록은 누구나 읽습니다. 이름 칸은 없고, 실제 사람이나 실제 사건의 정보는 받지 않습니다.",
  ],
] as const;

export default function AboutPage() {
  return (
    <Screen title="왜 만들었나" note={DISCLAIMER}>
      <section className="flex flex-col gap-5 rounded-[14px] border border-line bg-surface p-5">
        {SECTIONS.map(([heading, body]) => (
          <div key={heading} className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">{heading}</h2>
            <p className="text-base leading-7">{body}</p>
          </div>
        ))}
      </section>
    </Screen>
  );
}
