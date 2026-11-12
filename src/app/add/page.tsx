import type { Metadata } from "next";
import { AddForm } from "@/components/add-form";

export const metadata: Metadata = { title: "사례 추가" };

export default function AddPage() {
  return <AddForm />;
}
