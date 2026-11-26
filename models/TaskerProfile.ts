import { Schema, model, models, type Model, type Types } from "mongoose";

export type Availability = "available" | "busy" | "unavailable";

export interface ITaskerProfile {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  skills: string[];
  hourlyRate: number;
  location: string;
  bio: string;
  availability: Availability;
  ratingSum: number;
  ratingCount: number;
  ratingAvg: number;
  completedTasks: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskerProfileSchema = new Schema<ITaskerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    skills: { type: [String], default: [], index: true },
    hourlyRate: { type: Number, required: true, min: 1, max: 1000 },
    location: { type: String, default: "", trim: true },
    bio: { type: String, default: "", maxlength: 1000 },
    availability: {
      type: String,
      enum: ["available", "busy", "unavailable"],
      default: "available",
    },
    ratingSum: { type: Number, default: 0, min: 0 },
    ratingCount: { type: Number, default: 0, min: 0 },
    ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
    completedTasks: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

taskerProfileSchema.index({ availability: 1, hourlyRate: 1 });
taskerProfileSchema.index({ availability: 1, ratingAvg: -1 });
taskerProfileSchema.index({ skills: 1, hourlyRate: 1 });
taskerProfileSchema.index({ skills: 1, ratingAvg: -1 });
taskerProfileSchema.index({ location: 1, hourlyRate: 1 });
taskerProfileSchema.index({ skills: "text", bio: "text", location: "text" });

export const TaskerProfile: Model<ITaskerProfile> =
  (models.TaskerProfile as Model<ITaskerProfile>) ||
  model<ITaskerProfile>("TaskerProfile", taskerProfileSchema);
