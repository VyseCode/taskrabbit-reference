import { getSessionUser } from "@/lib/auth";
import { fail, handleError, ok } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { objectIdSchema } from "@/lib/schemas";
import { getOfferById } from "@/lib/queries";
import { Offer } from "@/models/Offer";

type Ctx = RouteContext<"/api/offers/[id]/withdraw">;

export async function POST(_request: Request, context: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);

    const parsed = objectIdSchema.safeParse((await context.params).id);
    if (!parsed.success) return fail("Invalid offer id", 400);

    await connectDB();
    const offer = await Offer.findById(parsed.data);
    if (!offer) return fail("Offer not found", 404);
    if (String(offer.tasker) !== user.id) {
      return fail("Only the tasker who made this offer can withdraw it", 403);
    }
    if (offer.status !== "pending") {
      return fail("Only pending offers can be withdrawn", 400);
    }

    offer.status = "withdrawn";
    await offer.save();
    return ok({ offer: await getOfferById(String(offer._id)) });
  } catch (error) {
    return handleError(error);
  }
}
