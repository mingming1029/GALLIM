import Link from "next/link";
import { Suspense } from "react";
import { APP_NAME, PROTOTYPE_LABEL } from "@/lib/copy";
import { LogoMark } from "@/components/logo";
import { SiteNav, SiteNavFallback } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 self-start rounded-md"
        >
          <LogoMark />
          <span className="text-xl font-semibold tracking-tight text-ink">
            {APP_NAME}
          </span>
          <span className="rounded-full border border-line px-2 py-0.5 text-xs text-muted">
            {PROTOTYPE_LABEL}
          </span>
        </Link>
        <Suspense fallback={<SiteNavFallback />}>
          <SiteNav />
        </Suspense>
      </div>
    </header>
  );
}
