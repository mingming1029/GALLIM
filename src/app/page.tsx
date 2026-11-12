import type { Metadata } from "next";
import { CaseList } from "@/components/case-list";
import { Screen } from "@/components/screen";
import { APP_NAME, DISCLAIMER, TAGLINE } from "@/lib/copy";

export const metadata: Metadata = { title: { absolute: "사례 목록 · 갈림" } };

export default function HomePage() {
  return (
    <Screen title={APP_NAME} lede={TAGLINE} note={DISCLAIMER}>
      <CaseList />
    </Screen>
  );
}
