export function Screen({
  title,
  lede,
  note,
  children,
}: {
  title: string;
  lede?: string;
  note?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {lede ? (
          <p className="text-base leading-7 text-ink sm:text-lg">{lede}</p>
        ) : null}
        {note ? (
          <p className="text-sm leading-6 text-muted">{note}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
