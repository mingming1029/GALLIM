import type { Metadata } from "next";
import { Suspense } from "react";
import { CaseDetail } from "@/components/case-detail";

export const metadata: Metadata = { title: "사례" };

function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <p className="text-sm text-muted">사례를 불러오는 중입니다.</p>
    </div>
  );
}

async function LoadedCase({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CaseDetail caseId={id} />;
}

export default function CasePage({ params }: PageProps<"/cases/[id]">) {
  return (
    <Suspense fallback={<Loading />}>
      <LoadedCase params={params} />
    </Suspense>
  );
}
