import type { Metadata } from "next";
import { Screen } from "@/components/screen";
import { DISCLAIMER } from "@/lib/copy";

export const metadata: Metadata = { title: "소개" };

const SECTIONS = [
  [
    "연습",
    "재범 위험성 평가를 연습하는 시제품입니다. 가상 사례만 사용합니다. 실제 대상자의 판단에 쓰는 도구가 아닙니다.",
  ],
  [
    "출처",
    "한국형사정책연구원 협동연구총서 11-38 「재범방지를 위한 범죄자처우의 과학화에 관한 연구(Ⅱ)」의 KORAS-G 및 매뉴얼에서 문항 요약을 사용했습니다.",
  ],
  [
    "한계",
    "AI 평가는 사전에 생성해 저장한 값이며, KORAS-G는 정적 요인이 많아 사람과 AI의 차이가 크지 않을 수 있다. 효과나 정확도를 검증하지 않았습니다.",
  ],
  [
    "데이터 처리",
    "앱을 열면 이름 없이 익명으로 한 번 로그인합니다. 채점과 최종 판단은 Supabase에 저장되고, 그 기록을 만든 방문자만 읽고 쓸 수 있습니다. 사례 본문은 데이터베이스에 두지 않고 앱 코드의 가상 사례를 읽습니다.",
  ],
] as const;

export default function AboutPage() {
  return (
    <Screen title="재범 위험성 평가 연습" note={DISCLAIMER}>
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
