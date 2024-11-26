import type { ItemEntityType } from "@/shared/models/entity/ItemEntityType";

import { ATableEditorItemEntity, aTableEditorItemEntitySchema } from "@/models/tableEditor/ATableEditorItemEntity";
import { TodoListItemType, todoListItemTypeSchema } from "@/models/tableEditor/todoList/TodoListItemType";
import { NOTES_MAX_LENGTH } from "@/services/tableEditor/todoList/constants";
import { createItemEntityTypeSchema } from "@/shared/models/entity/ItemEntityType";
import { z } from "zod";

export class TodoListItem extends ATableEditorItemEntity implements ItemEntityType<TodoListItemType> {
  dueAt: Date | null = null;
  notes = "";
  type = TodoListItemType.Todo;
}

export const todoListItemSchema = aTableEditorItemEntitySchema
  .merge(createItemEntityTypeSchema(todoListItemTypeSchema))
  .merge(
    z.object({
      dueAt: z.date().nullable(),
      notes: z.string().max(NOTES_MAX_LENGTH),
    }),
  ) satisfies z.ZodType<TodoListItem>;
