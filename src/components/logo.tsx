export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="8" className="fill-ink" />
      <path
        d="M16 6.5v7.2"
        className="stroke-bg"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M16 13.7c0 3.4-6.2 4.2-8.6 11"
        className="stroke-accent"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M16 13.7c0 3.4 6.2 4.2 8.6 11"
        className="stroke-path"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
