import { Schema, model, models, type Model, type Types } from "mongoose";

export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export interface IOffer {
  _id: Types.ObjectId;
  task: Types.ObjectId;
  tasker: Types.ObjectId;
  price: number;
  estimatedHours: number;
  message: string;
  status: OfferStatus;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    tasker: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 1, max: 100000 },
    estimatedHours: { type: Number, required: true, min: 0.5, max: 500 },
    message: { type: String, default: "", maxlength: 1000 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
  },
  { timestamps: true },
);

offerSchema.index({ task: 1, tasker: 1 }, { unique: true });
offerSchema.index({ task: 1, status: 1 });
offerSchema.index({ tasker: 1, status: 1 });
offerSchema.index({ tasker: 1, createdAt: -1 });

export const Offer: Model<IOffer> =
  (models.Offer as Model<IOffer>) || model<IOffer>("Offer", offerSchema);
