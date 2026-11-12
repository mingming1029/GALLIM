import type { Metadata } from "next";
import { Suspense } from "react";
import { RecordForm } from "@/components/record-form";

export const metadata: Metadata = { title: "판단 기록" };

function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <p className="text-sm text-muted">사례를 불러오는 중입니다.</p>
    </div>
  );
}

async function LoadedRecord({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RecordForm caseId={id} />;
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
