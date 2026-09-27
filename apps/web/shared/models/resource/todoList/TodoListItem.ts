import type { ToData } from "@esposter/shared";

import { ANamedItemEntity, aNamedItemEntitySchema } from "#shared/models/entity/ANamedItemEntity";
import { TODO_LIST_ITEM_NOTES_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { sanitizeTextHtml } from "@esposter/shared";
import { z } from "zod";

export class TodoListItem extends ANamedItemEntity {
  // When it was ticked, and absent while it is open: one field for both facts a completed row shows. Declared, so an item
  // Left open carries no key for it rather than an own `undefined` a parsed blob would not have
  declare completedAt?: Date;
  declare dueAt?: Date;
  // Starred, and absent otherwise, so an item nobody starred carries no key for it
  declare isImportant?: true;
  notes = "";

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
}) satisfies z.ZodType<ToData<TodoListItem>>;
