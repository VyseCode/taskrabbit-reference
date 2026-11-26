import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-[#177245]">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        The task or tasker you were looking for may have been removed.
      </p>
      <Link
        href="/marketplace"
        className="mt-6 rounded-full bg-[#177245] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f5a36]"
      >
        Back to marketplace
      </Link>
    </main>
  );
}
