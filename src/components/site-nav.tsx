"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, NAV_LINKS } from "@/lib/nav";

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="주요" className="flex flex-wrap gap-1.5">
      {NAV_LINKS.map((link) => {
        const active = isNavActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-full bg-ink px-3 py-1.5 text-sm font-medium text-bg"
                : "rounded-full px-3 py-1.5 text-sm text-muted hover:bg-accent-soft hover:text-ink"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteNavFallback() {
  return (
    <nav aria-hidden="true" className="flex flex-wrap gap-1.5">
      {NAV_LINKS.map((link) => (
        <span
          key={link.href}
          className="rounded-full px-3 py-1.5 text-sm text-muted"
        >
          {link.label}
        </span>
      ))}
    </nav>
  );
}
