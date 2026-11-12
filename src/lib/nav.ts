export const NAV_LINKS = [
  { href: "/", label: "사례 목록" },
  { href: "/analysis", label: "갈림 분석" },
  { href: "/about", label: "소개" },
] as const;

export function isNavActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/cases");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
