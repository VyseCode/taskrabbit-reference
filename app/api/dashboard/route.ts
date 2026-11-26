import { getSessionUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getDashboard } from "@/lib/queries";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);
    await connectDB();
    const dashboard = await getDashboard(user.id);
    if (!dashboard) return fail("Account not found", 404);
    return ok({ dashboard });
  } catch (error) {
    return handleError(error);
  }
}
