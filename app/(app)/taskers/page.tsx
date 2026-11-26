import Link from "next/link";
import { TaskerCard } from "@/components/TaskerCard";
import { connectDB } from "@/lib/db";
import { searchTaskers } from "@/lib/queries";

export const metadata = { title: "Find taskers" };

export default async function TaskersPage(props: PageProps<"/taskers">) {
  const params = await props.searchParams;
  const str = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
  const page = Math.min(Math.max(Number(params.page) || 1, 1), 1000);

  await connectDB();
  const result = await searchTaskers({
    skill: str("skill") || undefined,
    location: str("location") || undefined,
    availability: str("availability") || undefined,
    minRate: str("minRate") ? Number(str("minRate")) : undefined,
    maxRate: str("maxRate") ? Number(str("maxRate")) : undefined,
    minRating: str("minRating") ? Number(str("minRating")) : undefined,
    q: str("q") || undefined,
    sort: str("sort") || undefined,
    page,
    limit: 12,
  });

  const queryFor = (next: Record<string, string | number>) => {
    const search = new URLSearchParams();
    const merged: Record<string, string> = {
      skill: str("skill"),
      location: str("location"),
      availability: str("availability"),
      minRate: str("minRate"),
      maxRate: str("maxRate"),
      minRating: str("minRating"),
      q: str("q"),
      sort: str("sort"),
      page: String(page),
    };
    for (const [key, value] of Object.entries({ ...merged, ...next })) {
      if (value && value !== "0") search.set(key, String(value));
    }
    const string = search.toString();
    return string ? `/taskers?${string}` : "/taskers";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Find a tasker</h1>
        <p className="mt-1 text-sm text-slate-500">
          {result.total} {result.total === 1 ? "tasker" : "taskers"} match your search
        </p>
      </div>

      <form action="/taskers" method="get" className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <input aria-label="Search taskers" name="q" defaultValue={str("q")} placeholder="Skill, bio or location" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20" />
        <input aria-label="Skill" name="skill" defaultValue={str("skill")} placeholder="Skill e.g. Cleaning" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20" />
        <input aria-label="Location" name="location" defaultValue={str("location")} placeholder="Location" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20" />
        <select aria-label="Availability" name="availability" defaultValue={str("availability")} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="">Any availability</option>
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <input aria-label="Minimum hourly rate" name="minRate" type="number" min={1} defaultValue={str("minRate")} placeholder="Min $/hr" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20" />
        <input aria-label="Maximum hourly rate" name="maxRate" type="number" min={1} defaultValue={str("maxRate")} placeholder="Max $/hr" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20" />
        <select aria-label="Minimum rating" name="minRating" defaultValue={str("minRating")} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="">Any rating</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
        <div className="flex gap-2">
          <select aria-label="Sort by" name="sort" defaultValue={str("sort")} className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            <option value="rating">Top rated</option>
            <option value="rate_low">Rate: low to high</option>
            <option value="rate_high">Rate: high to low</option>
            <option value="newest">Newest</option>
          </select>
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Apply</button>
        </div>
      </form>

      {result.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-medium text-slate-700">No taskers found</p>
          <p className="mt-1 text-sm text-slate-500">Try widening your rate range or clearing filters.</p>
          <Link href="/taskers" className="mt-4 inline-block text-sm font-semibold text-[#177245] hover:underline">Clear filters</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((tasker) => <TaskerCard key={tasker.id} tasker={tasker} />)}
        </div>
      )}

      {result.totalPages > 1 && (
        <nav className="flex items-center justify-center gap-4 text-sm" aria-label="Pagination">
          {result.page > 1 ? <Link href={queryFor({ page: result.page - 1 })} className="rounded-lg border border-slate-200 bg-white px-4 py-2">Previous</Link> : <span className="px-4 py-2 text-slate-400">Previous</span>}
          <span className="text-slate-500">Page {result.page} of {result.totalPages}</span>
          {result.hasMore ? <Link href={queryFor({ page: result.page + 1 })} className="rounded-lg border border-slate-200 bg-white px-4 py-2">Next</Link> : <span className="px-4 py-2 text-slate-400">Next</span>}
        </nav>
      )}
    </div>
  );
}
