import type { ToData } from "@esposter/shared";

import { ANamedItemEntity, aNamedItemEntitySchema } from "#shared/models/entity/ANamedItemEntity";
import { TODO_LIST_ITEM_NOTES_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { sanitizeTextHtml } from "@esposter/shared";
import { z } from "zod";

export class TodoListItem extends ANamedItemEntity {
  dueAt: Date | null = null;
  notes = "";

  constructor(init?: Partial<TodoListItem>) {
    super();
    Object.assign(this, init);
  }
}

export const todoListItemSchema = z.object({
  ...aNamedItemEntitySchema.shape,
  dueAt: z.coerce.date().nullable(),
  notes: z.string().transform(sanitizeTextHtml).pipe(z.string().max(TODO_LIST_ITEM_NOTES_MAX_LENGTH)),
}) satisfies z.ZodType<ToData<TodoListItem>>;
