import { handleError, ok, pagination } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { searchTaskers } from "@/lib/queries";

function numParam(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const { page, limit } = pagination(params);

  try {
    await connectDB();
    const result = await searchTaskers({
      skill: params.get("skill") ?? undefined,
      minRate: numParam(params.get("minRate")),
      maxRate: numParam(params.get("maxRate")),
      minRating: numParam(params.get("minRating")),
      availability: params.get("availability") ?? undefined,
      location: params.get("location") ?? undefined,
      q: params.get("q") ?? undefined,
      sort: params.get("sort") ?? undefined,
      page,
      limit,
    });
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
