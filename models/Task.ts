import { Schema, model, models, type Model, type Types } from "mongoose";

export type TaskStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface ITask {
  _id: Types.ObjectId;
  client: Types.ObjectId;
  category: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  budget: number;
  status: TaskStatus;
  acceptedOffer: Types.ObjectId | null;
  offersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 3000 },
    location: { type: String, required: true, trim: true, maxlength: 120 },
    date: { type: Date, required: true, index: true },
    budget: { type: Number, required: true, min: 1, max: 100000 },
    status: {
      type: String,
      enum: ["open", "assigned", "in_progress", "completed", "cancelled"],
      default: "open",
    },
    acceptedOffer: { type: Schema.Types.ObjectId, ref: "Offer", default: null },
    offersCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

taskSchema.index({ status: 1, createdAt: -1 });
taskSchema.index({ category: 1, status: 1, createdAt: -1 });
taskSchema.index({ client: 1, status: 1 });
taskSchema.index({ client: 1, createdAt: -1 });
taskSchema.index({ status: 1, budget: 1 });
taskSchema.index({ status: 1, date: 1 });

export const Task: Model<ITask> =
  (models.Task as Model<ITask>) || model<ITask>("Task", taskSchema);
