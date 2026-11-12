import { DISCLAIMER } from "@/lib/copy";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-line">
      <p className="mx-auto w-full max-w-3xl px-4 py-5 text-sm leading-6 text-muted">
        {DISCLAIMER}
      </p>
    </footer>
  );
}
