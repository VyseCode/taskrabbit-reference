import { getSessionUser } from "@/lib/auth";
import { fail, handleError, ok, pagination, readJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { taskCreateSchema } from "@/lib/schemas";
import { getTaskById, getTasks } from "@/lib/queries";
import { Task } from "@/models/Task";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const { page, limit } = pagination(params);

  try {
    await connectDB();
    const result = await getTasks({
      status: params.get("status") ?? undefined,
      category: params.get("category") ?? undefined,
      clientId: params.get("clientId") ?? undefined,
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

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);

    const body = taskCreateSchema.parse(await readJson(request));
    await connectDB();
    const task = await Task.create({ ...body, client: user.id });
    return ok({ task: await getTaskById(String(task._id)) }, 201);
  } catch (error) {
    return handleError(error);
  }
}
