export default function Loading() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
      <span className="sr-only">Loading content…</span>
    </div>
  );
}
