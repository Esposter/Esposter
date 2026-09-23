import { z } from "zod";

export enum TodoStatus {
  Completed = "completed",
  InProgress = "in_progress",
  Pending = "pending",
}

export const todoStatusSchema: z.ZodEnum<typeof TodoStatus> = z.enum(TodoStatus) satisfies z.ZodType<TodoStatus>;
