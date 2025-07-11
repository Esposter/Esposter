import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { ToData } from "#shared/models/entity/ToData";

import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { TodoListItemType, todoListItemTypeSchema } from "#shared/models/tableEditor/todoList/TodoListItemType";
import { NOTES_MAX_LENGTH } from "#shared/services/tableEditor/todoList/constants";
import { z } from "zod";

export class TodoListItem extends ATableEditorItemEntity implements ItemEntityType<TodoListItemType> {
  dueAt: Date | null = null;
  notes = "";
  type = TodoListItemType.Todo;

  constructor(init?: Partial<TodoListItem>) {
    super();
    Object.assign(this, init);
  }
}

export const todoListItemSchema = z.object({
  ...aTableEditorItemEntitySchema.shape,
  ...createItemEntityTypeSchema(todoListItemTypeSchema).shape,
  dueAt: z.date().nullable(),
  notes: z.string().max(NOTES_MAX_LENGTH),
}) satisfies z.ZodType<ToData<TodoListItem>>;
