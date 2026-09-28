import { ITEM_NAME_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { createNameSchema } from "@esposter/db-schema";
import { z } from "zod";

// A line of a todo's checklist: a name, and when it was ticked, absent while it is open as its todo's own is
export interface TodoListStep {
  completedAt?: Date;
  id: string;
  name: string;
}

export const todoListStepSchema = z.object({
  completedAt: z.coerce.date().optional(),
  id: z.uuid(),
  name: createNameSchema(ITEM_NAME_MAX_LENGTH),
}) satisfies z.ZodType<TodoListStep>;
