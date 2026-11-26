import { handleError, ok } from "@/lib/api";
import { CATEGORIES } from "@/lib/categories";
import { connectDB } from "@/lib/db";
import { Task } from "@/models/Task";
import type { CategoryDTO } from "@/lib/types";

export async function GET() {
  try {
    await connectDB();
    const counts = await Task.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);
    const bySlug = new Map(counts.map((row) => [row._id, row.count]));
    const items: CategoryDTO[] = CATEGORIES.map((category) => ({
      slug: category.slug,
      name: category.name,
      description: category.description,
      taskCount: bySlug.get(category.slug) ?? 0,
    }));
    return ok({ items });
  } catch (error) {
    return handleError(error);
  }
}
