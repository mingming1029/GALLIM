import type { Metadata } from "next";
import { Suspense } from "react";
import { ScoreForm } from "@/components/score-form";

export const metadata: Metadata = { title: "채점" };

function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <p className="text-sm text-muted">사례를 불러오는 중입니다.</p>
    </div>
  );
}

async function LoadedRecord({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ScoreForm caseId={id} />;
}

export default function RecordPage({
  params,
}: PageProps<"/cases/[id]/record">) {
  return (
    <Suspense fallback={<Loading />}>
      <LoadedRecord params={params} />
    </Suspense>
  );
}
