import type { Recurrence } from "#shared/models/resource/todoList/Recurrence";
import type { TodoListItemOrigin } from "#shared/models/resource/todoList/TodoListItemOrigin";
import type { TodoListStep } from "#shared/models/resource/todoList/TodoListStep";
import type { ToData } from "@esposter/shared";

import { ANamedItemEntity, aNamedItemEntitySchema } from "#shared/models/entity/ANamedItemEntity";
import { recurrenceSchema } from "#shared/models/resource/todoList/Recurrence";
import { todoListItemOriginSchema } from "#shared/models/resource/todoList/TodoListItemOrigin";
import { todoListStepSchema } from "#shared/models/resource/todoList/TodoListStep";
import {
  TODO_LIST_ITEM_NOTES_MAX_LENGTH,
  TODO_LIST_ITEM_STEPS_MAX_LENGTH,
} from "#shared/services/resource/item/constants";
import { createUniqueArraySchema, sanitizeTextHtml } from "@esposter/shared";
import { z } from "zod";

export class TodoListItem extends ANamedItemEntity {
  // When it was ticked, and absent while it is open: one field for both facts a completed row shows. Declared, so an
  // Item left open carries no key for it rather than an own `undefined` a parsed blob would not have
  declare completedAt?: Date;
  declare dueAt?: Date;
  // Starred, and absent otherwise, so an item nobody starred carries no key for it
  declare isImportant?: true;
  notes = "";
  // The repository and session a follow-up came from, and absent on every todo the owner wrote
  declare origin?: TodoListItemOrigin;
  // Absent on a todo that does not repeat; one that does is rolled to its next due date when it is ticked
  declare recurrence?: Recurrence;
  // Its checklist, one level deep, and absent until it has a step, so an item without one carries no key for it
  declare steps?: TodoListStep[];

  constructor(init?: Partial<TodoListItem>) {
    super();
    Object.assign(this, init);
  }
}

export const todoListItemSchema = z.object({
  ...aNamedItemEntitySchema.shape,
  completedAt: z.coerce.date().optional(),
  dueAt: z.coerce.date().optional(),
  isImportant: z.literal(true).optional(),
  notes: z.string().transform(sanitizeTextHtml).pipe(z.string().max(TODO_LIST_ITEM_NOTES_MAX_LENGTH)),
  origin: todoListItemOriginSchema.optional(),
  recurrence: recurrenceSchema.optional(),
  steps: createUniqueArraySchema(todoListStepSchema, "id").min(1).max(TODO_LIST_ITEM_STEPS_MAX_LENGTH).optional(),
}) satisfies z.ZodType<ToData<TodoListItem>>;
