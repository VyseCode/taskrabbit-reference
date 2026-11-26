import { Types } from "mongoose";
import { User } from "@/models/User";
import { Task } from "@/models/Task";
import { TaskerProfile } from "@/models/TaskerProfile";
import { Offer } from "@/models/Offer";
import { Review } from "@/models/Review";
import type {
  DashboardDTO,
  OfferDTO,
  PageResult,
  ReviewDTO,
  TaskDTO,
  TaskerDTO,
} from "@/lib/types";
import { pageResult } from "@/lib/api";

type LeanUser = {
  _id: Types.ObjectId;
  name: string;
  avatarUrl?: string;
  email?: string;
};

type LeanTask = {
  _id: Types.ObjectId;
  client: LeanUser | null;
  category: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  budget: number;
  status: TaskDTO["status"];
  acceptedOffer?: Types.ObjectId | null;
  offersCount?: number;
  createdAt: Date;
};

type LeanProfile = {
  _id: Types.ObjectId;
  user: LeanUser | null;
  skills: string[];
  hourlyRate: number;
  location: string;
  bio: string;
  availability: TaskerDTO["availability"];
  ratingAvg: number;
  ratingCount: number;
  completedTasks: number;
};

type LeanOffer = {
  _id: Types.ObjectId;
  task: LeanTask | null;
  tasker: LeanUser | null;
  price: number;
  estimatedHours: number;
  message: string;
  status: OfferDTO["status"];
  createdAt: Date;
};

type LeanReview = {
  _id: Types.ObjectId;
  task: Types.ObjectId;
  tasker: Types.ObjectId;
  client: LeanUser | null;
  rating: number;
  comment: string;
  createdAt: Date;
};

function id(value: Types.ObjectId | undefined | null): string {
  return value ? value.toString() : "";
}

function person(user: LeanUser | null) {
  return {
    id: id(user?._id),
    name: user?.name ?? "Former member",
    avatarUrl: user?.avatarUrl ?? "",
  };
}

export function toTaskDTO(doc: LeanTask): TaskDTO {
  const client = person(doc.client);
  return {
    id: id(doc._id),
    clientId: client.id,
    clientName: client.name,
    category: doc.category,
    title: doc.title,
    description: doc.description,
    location: doc.location,
    date: new Date(doc.date).toISOString(),
    budget: doc.budget,
    status: doc.status,
    offersCount: doc.offersCount ?? 0,
    acceptedOfferId: doc.acceptedOffer ? id(doc.acceptedOffer) : null,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export function toTaskerDTO(doc: LeanProfile): TaskerDTO {
  const user = person(doc.user);
  return {
    id: id(doc._id),
    userId: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    skills: doc.skills ?? [],
    hourlyRate: doc.hourlyRate,
    location: doc.location,
    bio: doc.bio,
    availability: doc.availability,
    ratingAvg: doc.ratingAvg ?? 0,
    ratingCount: doc.ratingCount ?? 0,
    completedTasks: doc.completedTasks ?? 0,
  };
}

export function toOfferDTO(doc: LeanOffer): OfferDTO {
  return {
    id: id(doc._id),
    taskId: id(doc.task?._id),
    taskTitle: doc.task?.title ?? "Removed task",
    taskStatus: doc.task?.status ?? "cancelled",
    taskerId: id(doc.tasker?._id),
    taskerName: doc.tasker?.name ?? "Former member",
    price: doc.price,
    estimatedHours: doc.estimatedHours,
    message: doc.message,
    status: doc.status,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export function toReviewDTO(doc: LeanReview): ReviewDTO {
  const author = person(doc.client);
  return {
    id: id(doc._id),
    taskId: id(doc.task),
    taskerId: id(doc.tasker),
    authorId: author.id,
    authorName: author.name,
    rating: doc.rating,
    comment: doc.comment,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

const taskSorts: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  budget_desc: { budget: -1 },
  budget_asc: { budget: 1 },
  date: { date: 1 },
};

export async function getTasks(
  options: {
    status?: string;
    category?: string;
    clientId?: string;
    q?: string;
    sort?: string;
    page: number;
    limit: number;
  },
): Promise<PageResult<TaskDTO>> {
  const filter: Record<string, unknown> = {};
  if (options.status) filter.status = options.status;
  if (options.category) filter.category = options.category;
  if (options.clientId && Types.ObjectId.isValid(options.clientId)) {
    filter.client = new Types.ObjectId(options.clientId);
  }
  if (options.q) {
    const escaped = options.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (escaped) filter.title = new RegExp(escaped, "i");
  }

  const sort = taskSorts[options.sort ?? "newest"] ?? taskSorts.newest;
  const [docs, total] = await Promise.all([
    Task.find(filter)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .populate("client", "name avatarUrl")
      .lean(),
    Task.countDocuments(filter),
  ]);

  return pageResult(
    (docs as unknown as LeanTask[]).map(toTaskDTO),
    total,
    options.page,
    options.limit,
  );
}

export async function getTaskById(taskId: string): Promise<TaskDTO | null> {
  if (!Types.ObjectId.isValid(taskId)) return null;
  const doc = await Task.findById(taskId)
    .populate("client", "name avatarUrl")
    .lean();
  return doc ? toTaskDTO(doc as unknown as LeanTask) : null;
}

export async function getTaskerProfileByUserId(
  userId: string,
): Promise<TaskerDTO | null> {
  if (!Types.ObjectId.isValid(userId)) return null;
  const doc = await TaskerProfile.findOne({ user: userId })
    .populate("user", "name avatarUrl")
    .lean();
  return doc ? toTaskerDTO(doc as unknown as LeanProfile) : null;
}

const taskerSorts: Record<string, Record<string, 1 | -1>> = {
  rating: { ratingAvg: -1, ratingCount: -1 },
  rate_low: { hourlyRate: 1 },
  rate_high: { hourlyRate: -1 },
  newest: { createdAt: -1 },
};

export async function searchTaskers(
  options: {
    skill?: string;
    minRate?: number;
    maxRate?: number;
    minRating?: number;
    availability?: string;
    location?: string;
    q?: string;
    sort?: string;
    page: number;
    limit: number;
  },
): Promise<PageResult<TaskerDTO>> {
  const filter: Record<string, unknown> = {};
  if (options.skill) filter.skills = new RegExp(escape(options.skill), "i");
  if (options.location) filter.location = new RegExp(escape(options.location), "i");
  if (options.availability) filter.availability = options.availability;
  if (options.minRate !== undefined || options.maxRate !== undefined) {
    filter.hourlyRate = {
      ...(options.minRate !== undefined ? { $gte: options.minRate } : {}),
      ...(options.maxRate !== undefined ? { $lte: options.maxRate } : {}),
    };
  }
  if (options.minRating !== undefined) {
    filter.ratingAvg = { $gte: options.minRating };
  }
  if (options.q) {
    const regex = new RegExp(escape(options.q), "i");
    filter.$or = [{ skills: regex }, { bio: regex }, { location: regex }];
  }

  const sort = taskerSorts[options.sort ?? "rating"] ?? taskerSorts.rating;
  const [docs, total] = await Promise.all([
    TaskerProfile.find(filter)
      .sort(sort)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .populate("user", "name avatarUrl")
      .lean(),
    TaskerProfile.countDocuments(filter),
  ]);

  return pageResult(
    (docs as unknown as LeanProfile[]).map(toTaskerDTO),
    total,
    options.page,
    options.limit,
  );
}

function escape(value: string): string {
  return value.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getOffersForTask(taskId: string): Promise<OfferDTO[]> {
  if (!Types.ObjectId.isValid(taskId)) return [];
  const docs = await Offer.find({ task: taskId })
    .sort({ createdAt: 1 })
    .populate("task", "title status")
    .populate("tasker", "name avatarUrl")
    .lean();
  return (docs as unknown as LeanOffer[]).map(toOfferDTO);
}

export async function getOfferById(offerId: string): Promise<OfferDTO | null> {
  if (!Types.ObjectId.isValid(offerId)) return null;
  const doc = await Offer.findById(offerId)
    .populate("task", "title status")
    .populate("tasker", "name avatarUrl")
    .lean();
  return doc ? toOfferDTO(doc as unknown as LeanOffer) : null;
}

export async function getVisibleOffers(
  taskId: string,
  viewerId: string,
  isOwner: boolean,
): Promise<OfferDTO[]> {
  if (!Types.ObjectId.isValid(taskId)) return [];
  const filter: Record<string, unknown> = { task: taskId };
  if (!isOwner && Types.ObjectId.isValid(viewerId)) {
    filter.$or = [{ tasker: new Types.ObjectId(viewerId) }, { status: "accepted" }];
  }
  const docs = await Offer.find(filter)
    .sort({ createdAt: 1 })
    .populate("task", "title status")
    .populate("tasker", "name avatarUrl")
    .lean();
  return (docs as unknown as LeanOffer[]).map(toOfferDTO);
}

export async function getOffersByTasker(
  userId: string,
): Promise<OfferDTO[]> {
  if (!Types.ObjectId.isValid(userId)) return [];
  const docs = await Offer.find({ tasker: userId })
    .sort({ createdAt: -1 })
    .limit(200)
    .populate("task", "title status")
    .populate("tasker", "name avatarUrl")
    .lean();
  return (docs as unknown as LeanOffer[]).map(toOfferDTO);
}

export async function getReviewsForTasker(
  userId: string,
): Promise<ReviewDTO[]> {
  if (!Types.ObjectId.isValid(userId)) return [];
  const docs = await Review.find({ tasker: userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("client", "name avatarUrl")
    .lean();
  return (docs as unknown as LeanReview[]).map(toReviewDTO);
}

export async function getReviewsForTask(taskId: string): Promise<ReviewDTO[]> {
  if (!Types.ObjectId.isValid(taskId)) return [];
  const docs = await Review.find({ task: taskId })
    .sort({ createdAt: -1 })
    .populate("client", "name avatarUrl")
    .lean();
  return (docs as unknown as LeanReview[]).map(toReviewDTO);
}

export async function getUserDisplay(userId: string) {
  if (!Types.ObjectId.isValid(userId)) return null;
  return User.findById(userId).select("name avatarUrl role location").lean();
}

export async function categoryCounts(): Promise<Map<string, number>> {
  const rows = await Task.aggregate<{ _id: string; count: number }>([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((row) => [row._id, row.count]));
}

export async function getDashboard(userId: string): Promise<DashboardDTO | null> {
  if (!Types.ObjectId.isValid(userId)) return null;
  const user = await User.findById(userId).select("role").lean();
  if (!user) return null;

  const [myTasks, myOffers, profile] = await Promise.all([
    Task.find({ client: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("client", "name avatarUrl")
      .lean(),
    getOffersByTasker(userId),
    getTaskerProfileByUserId(userId),
  ]);

  const tasks = (myTasks as unknown as LeanTask[]).map(toTaskDTO);
  const offersOnMyTasks =
    tasks.length === 0
      ? []
      : (
          await Offer.find({ task: { $in: tasks.map((task) => task.id) } })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate("task", "title status")
            .populate("tasker", "name avatarUrl")
            .lean()
        ) as unknown as LeanOffer[];

  const clientOffers = offersOnMyTasks.map(toOfferDTO);
  const acceptedSpend = clientOffers
    .filter((offer) => offer.status === "accepted" && offer.taskStatus === "completed")
    .reduce((sum, offer) => sum + offer.price, 0);
  const earnings = myOffers
    .filter((offer) => offer.status === "accepted" && offer.taskStatus === "completed")
    .reduce((sum, offer) => sum + offer.price, 0);

  return {
    role: user.role,
    client: {
      tasks,
      offers: clientOffers,
      taskCount: tasks.length,
      openCount: tasks.filter((task) => task.status === "open").length,
      spend: acceptedSpend,
    },
    tasker: {
      offers: myOffers,
      earnings,
      completedCount: profile?.completedTasks ?? 0,
      profile,
    },
  };
}
