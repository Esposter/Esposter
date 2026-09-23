import type { TodoStatus } from "#src/models/event/TodoStatus";

import { todoStatusSchema } from "#src/models/event/TodoStatus";
import { z } from "zod";

export interface Todo {
  activeForm: string;
  content: string;
  id: string;
  status: TodoStatus;
}

export const todoSchema: z.ZodObject<{
  activeForm: z.ZodString;
  content: z.ZodString;
  id: z.ZodString;
  status: typeof todoStatusSchema;
}> = z.object({
  activeForm: z.string(),
  content: z.string(),
  id: z.string().min(1),
  status: todoStatusSchema,
}) satisfies z.ZodType<Todo>;
