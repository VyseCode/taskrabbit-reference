import { getSessionUser } from "@/lib/auth";
import { fail, handleError, ok, readJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { profileCreateSchema, profileUpdateSchema } from "@/lib/schemas";
import { getTaskerProfileByUserId } from "@/lib/queries";
import { TaskerProfile } from "@/models/TaskerProfile";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);
    await connectDB();
    return ok({ profile: await getTaskerProfileByUserId(user.id) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);

    const body = profileCreateSchema.parse(await readJson(request));
    await connectDB();
    if (await TaskerProfile.exists({ user: user.id })) {
      return fail("You already have a tasker profile", 409);
    }
    await TaskerProfile.create({ ...body, user: user.id });
    return ok({ profile: await getTaskerProfileByUserId(user.id) }, 201);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);

    const body = profileUpdateSchema.parse(await readJson(request));
    await connectDB();
    const profile = await TaskerProfile.findOne({ user: user.id });
    if (!profile) return fail("Tasker profile not found", 404);

    Object.assign(profile, body);
    await profile.save();
    return ok({ profile: await getTaskerProfileByUserId(user.id) });
  } catch (error) {
    return handleError(error);
  }
}
