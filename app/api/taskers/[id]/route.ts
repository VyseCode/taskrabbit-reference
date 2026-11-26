import { fail, handleError, ok } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getReviewsForTasker, getTaskerProfileByUserId } from "@/lib/queries";

type Ctx = RouteContext<"/api/taskers/[id]">;

export async function GET(_request: Request, context: Ctx) {
  try {
    const { id } = await context.params;
    await connectDB();
    const tasker = await getTaskerProfileByUserId(id);
    if (!tasker) return fail("Tasker not found", 404);
    const reviews = await getReviewsForTasker(id);
    return ok({ tasker, reviews });
  } catch (error) {
    return handleError(error);
  }
}
