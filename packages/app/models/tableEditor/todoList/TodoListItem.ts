import type { ItemEntityType } from "@/models/shared/entity/ItemEntityType";
import { createItemEntityTypeSchema } from "@/models/shared/entity/ItemEntityType";
import { ATableEditorItemEntity, aTableEditorItemEntitySchema } from "@/models/tableEditor/ATableEditorItemEntity";
import { TodoListItemType, todoListItemTypeSchema } from "@/models/tableEditor/todoList/TodoListItemType";
import { NOTES_MAX_LENGTH } from "@/services/tableEditor/todoList/constants";
import { z } from "zod";

export class TodoListItem extends ATableEditorItemEntity implements ItemEntityType<TodoListItemType> {
  type = TodoListItemType.Todo;
  notes = "";
  dueAt: Date | null = null;
}

export const todoListItemSchema = aTableEditorItemEntitySchema
  .merge(createItemEntityTypeSchema(todoListItemTypeSchema))
  .merge(
    z.object({
      notes: z.string().max(NOTES_MAX_LENGTH),
      dueAt: z.date().nullable(),
    }),
  ) satisfies z.ZodType<TodoListItem>;
