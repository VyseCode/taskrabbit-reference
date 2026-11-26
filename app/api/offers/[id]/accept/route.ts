import { getSessionUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { objectIdSchema } from "@/lib/schemas";
import { getOfferById, getTaskById } from "@/lib/queries";
import { Offer } from "@/models/Offer";
import { Task } from "@/models/Task";

type Ctx = RouteContext<"/api/offers/[id]/accept">;

export async function POST(_request: Request, context: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);

    const parsed = objectIdSchema.safeParse((await context.params).id);
    if (!parsed.success) return fail("Invalid offer id", 400);

    await connectDB();
    const offer = await Offer.findById(parsed.data);
    if (!offer) return fail("Offer not found", 404);

    const task = await Task.findById(offer.task);
    if (!task) return fail("Task not found", 404);
    if (String(task.client) !== user.id) {
      return fail("Only the task owner can accept offers", 403);
    }
    if (task.status !== "open" || task.acceptedOffer) {
      return fail("An offer has already been accepted or the task is closed", 409);
    }
    if (offer.status !== "pending") {
      return fail("Only pending offers can be accepted", 400);
    }

    const claimed = await Task.updateOne(
      { _id: task._id, status: "open", acceptedOffer: null },
      { $set: { status: "assigned", acceptedOffer: offer._id } },
    );
    if (claimed.matchedCount === 0) {
      return fail("An offer has already been accepted or the task is closed", 409);
    }

    offer.status = "accepted";
    await offer.save();
    await Offer.updateMany(
      { task: task._id, _id: { $ne: offer._id }, status: "pending" },
      { $set: { status: "rejected" } },
    );

    return ok({
      task: await getTaskById(String(task._id)),
      offer: await getOfferById(String(offer._id)),
    });
  } catch (error) {
    return handleError(error);
  }
}
