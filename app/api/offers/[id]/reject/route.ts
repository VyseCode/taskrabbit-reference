import { getSessionUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { objectIdSchema } from "@/lib/schemas";
import { getOfferById } from "@/lib/queries";
import { Offer } from "@/models/Offer";
import { Task } from "@/models/Task";

type Ctx = RouteContext<"/api/offers/[id]/reject">;

export async function POST(_request: Request, context: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);

    const parsed = objectIdSchema.safeParse((await context.params).id);
    if (!parsed.success) return fail("Invalid offer id", 400);

    await connectDB();
    const offer = await Offer.findById(parsed.data);
    if (!offer) return fail("Offer not found", 404);

    const task = await Task.findById(offer.task).select("client").lean();
    if (!task) return fail("Task not found", 404);
    if (String(task.client) !== user.id) {
      return fail("Only the task owner can reject offers", 403);
    }
    if (offer.status !== "pending") {
      return fail("Only pending offers can be rejected", 400);
    }

    offer.status = "rejected";
    await offer.save();
    return ok({ offer: await getOfferById(String(offer._id)) });
  } catch (error) {
    return handleError(error);
  }
}
