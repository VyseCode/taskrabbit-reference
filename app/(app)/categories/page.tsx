import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { connectDB } from "@/lib/db";
import { categoryCounts } from "@/lib/queries";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await connectDB();
  const counts = await categoryCounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Categories</h1>
        <p className="mt-1 text-sm text-slate-500">Find the right kind of help for your task.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/tasks?category=${category.slug}`}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#177245]/40 hover:shadow-md"
          >
            <h2 className="font-semibold text-slate-900 group-hover:text-[#177245]">{category.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{category.description}</p>
            <p className="mt-4 text-xs font-semibold text-[#177245]">
              {counts.get(category.slug) ?? 0} tasks →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
