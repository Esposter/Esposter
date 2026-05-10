import type { ItemEntityType, ToData } from "@esposter/shared";

import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/data/ATableEditorItemEntity";
import { TodoListItemType, todoListItemTypeSchema } from "#shared/models/tableEditor/todoList/TodoListItemType";
import { DESCRIPTION_MAX_LENGTH } from "#shared/services/constants";
import { createItemEntityTypeSchema } from "@esposter/shared";
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
  notes: z.string().max(DESCRIPTION_MAX_LENGTH),
}) satisfies z.ZodType<ToData<TodoListItem>>;
