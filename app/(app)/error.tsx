"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-500">
        We could not load this page. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-full bg-[#177245] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f5a36]"
      >
        Try again
      </button>
    </div>
  );
}
