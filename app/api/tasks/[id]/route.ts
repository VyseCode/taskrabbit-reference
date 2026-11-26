import { getSessionUser } from "@/lib/auth";
import { fail, handleError, ok, readJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { taskUpdateSchema } from "@/lib/schemas";
import { getTaskById } from "@/lib/queries";
import { Task } from "@/models/Task";

type Ctx = RouteContext<"/api/tasks/[id]">;

export async function GET(_request: Request, context: Ctx) {
  try {
    const { id } = await context.params;
    await connectDB();
    const task = await getTaskById(id);
    if (!task) return fail("Task not found", 404);
    return ok({ task });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, context: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);

    const { id } = await context.params;
    await connectDB();
    const task = await Task.findById(id);
    if (!task) return fail("Task not found", 404);
    if (String(task.client) !== user.id) {
      return fail("Only the task owner can edit this task", 403);
    }
    if (task.status !== "open") {
      return fail("Only open tasks can be edited", 400);
    }

    const body = taskUpdateSchema.parse(await readJson(request));
    Object.assign(task, body);
    await task.save();

    return ok({ task: await getTaskById(id) });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);

    const { id } = await context.params;
    await connectDB();
    const task = await Task.findById(id);
    if (!task) return fail("Task not found", 404);
    if (String(task.client) !== user.id) {
      return fail("Only the task owner can cancel this task", 403);
    }
    if (!["open", "assigned", "in_progress"].includes(task.status)) {
      return fail("This task can no longer be cancelled", 400);
    }

    task.status = "cancelled";
    await task.save();
    return ok({ task: await getTaskById(id) });
  } catch (error) {
    return handleError(error);
  }
}
