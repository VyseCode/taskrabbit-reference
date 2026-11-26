import { Types } from "mongoose";
import { z } from "zod";
import { CATEGORY_SLUGS } from "@/lib/categories";

export const objectIdSchema = z
  .string()
  .refine((value) => Types.ObjectId.isValid(value), "Invalid id");

export const taskCreateSchema = z.object({
  category: z.enum(CATEGORY_SLUGS),
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(3000),
  location: z.string().trim().min(2, "Location is required").max(120),
  date: z.coerce
    .date()
    .refine((value) => value.getTime() > Date.now(), "Task date must be in the future"),
  budget: z.number().min(1, "Budget must be at least 1").max(100000),
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const taskStatusSchema = z.object({
  status: z.enum(["assigned", "in_progress", "completed", "cancelled"]),
});

export const profileCreateSchema = z.object({
  skills: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one skill")
    .max(20),
  hourlyRate: z.number().min(1).max(1000),
  location: z.string().trim().min(2, "Location is required").max(120),
  bio: z.string().trim().max(1000),
  availability: z.enum(["available", "busy", "unavailable"]),
});

export const profileUpdateSchema = profileCreateSchema.partial();

export const offerCreateSchema = z.object({
  price: z.number().min(1, "Price must be at least 1").max(100000),
  estimatedHours: z.number().min(0.5).max(500),
  message: z.string().trim().max(1000),
});

export const reviewCreateSchema = z.object({
  taskId: objectIdSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000),
});
