import { getSessionUser } from "@/lib/auth";
import { fail, handleError, isDuplicateKeyError, ok, readJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { offerCreateSchema, objectIdSchema } from "@/lib/schemas";
import { getOfferById, getVisibleOffers } from "@/lib/queries";
import { Offer } from "@/models/Offer";
import { Task } from "@/models/Task";

type Ctx = RouteContext<"/api/tasks/[id]/offers">;

export async function GET(_request: Request, context: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);

    const parsed = objectIdSchema.safeParse((await context.params).id);
    if (!parsed.success) return fail("Invalid task id", 400);
    const id = parsed.data;

    await connectDB();
    const task = await Task.findById(id).select("client").lean();
    if (!task) return fail("Task not found", 404);

    const isOwner = String(task.client) === user.id;
    return ok({ offers: await getVisibleOffers(id, user.id, isOwner) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request, context: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);

    const parsed = objectIdSchema.safeParse((await context.params).id);
    if (!parsed.success) return fail("Invalid task id", 400);
    const id = parsed.data;
    const body = offerCreateSchema.parse(await readJson(request));

    await connectDB();
    const task = await Task.findById(id);
    if (!task) return fail("Task not found", 404);
    if (task.status !== "open") {
      return fail("This task is not open for offers", 400);
    }
    if (String(task.client) === user.id) {
      return fail("You cannot submit an offer on your own task", 400);
    }
    if (await Offer.exists({ task: id, tasker: user.id })) {
      return fail("You have already submitted an offer on this task", 409);
    }

    const offer = await Offer.create({ ...body, task: id, tasker: user.id });
    await Task.updateOne({ _id: id }, { $inc: { offersCount: 1 } });
    return ok({ offer: await getOfferById(String(offer._id)) }, 201);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return fail("You have already submitted an offer on this task", 409);
    }
    return handleError(error);
  }
}
