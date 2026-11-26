import { getSessionUser } from "@/lib/auth";
import { fail, handleError, ok, readJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { objectIdSchema, taskStatusSchema } from "@/lib/schemas";
import { getTaskById } from "@/lib/queries";
import { Offer } from "@/models/Offer";
import { Task } from "@/models/Task";
import { TaskerProfile } from "@/models/TaskerProfile";

type Ctx = RouteContext<"/api/tasks/[id]/status">;

const transitions: Record<string, string[]> = {
  open: ["cancelled"],
  assigned: ["in_progress", "completed", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export async function POST(request: Request, context: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);

    const parsed = objectIdSchema.safeParse((await context.params).id);
    if (!parsed.success) return fail("Invalid task id", 400);
    const { status } = taskStatusSchema.parse(await readJson(request));

    await connectDB();
    const task = await Task.findById(parsed.data);
    if (!task) return fail("Task not found", 404);
    if (String(task.client) !== user.id) {
      return fail("Only the task owner can change task status", 403);
    }
    if (!transitions[task.status]?.includes(status)) {
      return fail(`Cannot move a task from ${task.status} to ${status}`, 400);
    }

    if (status === "completed") {
      if (!task.acceptedOffer) {
        return fail("Accept an offer before completing this task", 400);
      }
      const accepted = await Offer.findById(task.acceptedOffer)
        .select("tasker status")
        .lean();
      if (!accepted || accepted.status !== "accepted") {
        return fail("The accepted offer could not be found", 400);
      }
      await TaskerProfile.updateOne(
        { user: accepted.tasker },
        { $inc: { completedTasks: 1 } },
      );
    }

    task.status = status;
    await task.save();
    return ok({ task: await getTaskById(String(task._id)) });
  } catch (error) {
    return handleError(error);
  }
}
