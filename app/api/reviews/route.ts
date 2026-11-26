import { Types } from "mongoose";
import { getSessionUser } from "@/lib/auth";
import { fail, handleError, isDuplicateKeyError, ok, readJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { reviewCreateSchema } from "@/lib/schemas";
import {
  getReviewsForTask,
  getReviewsForTasker,
  getTaskerProfileByUserId,
} from "@/lib/queries";
import { Offer } from "@/models/Offer";
import { Review } from "@/models/Review";
import { Task } from "@/models/Task";
import { TaskerProfile } from "@/models/TaskerProfile";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("You must be signed in", 401);

    const body = reviewCreateSchema.parse(await readJson(request));
    await connectDB();

    const task = await Task.findById(body.taskId);
    if (!task) return fail("Task not found", 404);
    if (task.status !== "completed") {
      return fail("A task must be completed before it can be reviewed", 400);
    }
    if (String(task.client) !== user.id) {
      return fail("Only the client who posted this task can review it", 403);
    }
    if (!task.acceptedOffer) {
      return fail("No accepted offer exists for this task", 400);
    }
    if (await Review.exists({ task: task._id })) {
      return fail("This task has already been reviewed", 409);
    }

    const accepted = await Offer.findById(task.acceptedOffer)
      .select("tasker")
      .lean();
    if (!accepted) return fail("The accepted offer could not be found", 404);

    const review = await Review.create({
      task: task._id,
      client: user.id,
      tasker: accepted.tasker,
      rating: body.rating,
      comment: body.comment,
    });

    await TaskerProfile.updateOne(
      { user: accepted.tasker },
      [
        {
          $set: {
            ratingSum: { $add: ["$ratingSum", body.rating] },
            ratingCount: { $add: ["$ratingCount", 1] },
            ratingAvg: {
              $round: [
                {
                  $divide: [
                    { $add: ["$ratingSum", body.rating] },
                    { $add: ["$ratingCount", 1] },
                  ],
                },
                2,
              ],
            },
          },
        },
      ],
      { updatePipeline: true },
    );

    return ok(
      {
        review: {
          id: String(review._id),
          taskId: String(review.task),
          taskerId: String(review.tasker),
          rating: review.rating,
          comment: review.comment,
        },
        tasker: await getTaskerProfileByUserId(String(accepted.tasker)),
      },
      201,
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return fail("This task has already been reviewed", 409);
    }
    return handleError(error);
  }
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const taskId = params.get("taskId") ?? "";
  const taskerId = params.get("taskerId") ?? "";

  if (!taskId && !taskerId) {
    return fail("Provide a taskId or taskerId", 400);
  }
  if (taskId && !Types.ObjectId.isValid(taskId)) {
    return fail("Invalid task id", 400);
  }
  if (taskerId && !Types.ObjectId.isValid(taskerId)) {
    return fail("Invalid tasker id", 400);
  }

  try {
    await connectDB();
    const items = taskId
      ? await getReviewsForTask(taskId)
      : await getReviewsForTasker(taskerId);
    return ok({ items });
  } catch (error) {
    return handleError(error);
  }
}
