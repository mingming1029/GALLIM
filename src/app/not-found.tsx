import Link from "next/link";
import { Screen } from "@/components/screen";

export default function NotFound() {
  return (
    <Screen title="갈림" lede="이 주소에는 화면이 없습니다.">
      <Link
        href="/"
        className="self-start rounded-full bg-ink px-4 py-2 text-sm font-medium text-bg"
      >
        사례 목록으로
      </Link>
    </Screen>
  );
}
