import { AItemEntity, aItemEntitySchema } from "@/models/shared/AItemEntity";
import type { ItemEntityType } from "@/models/tableEditor/ItemEntityType";
import { createItemEntityTypeSchema } from "@/models/tableEditor/ItemEntityType";
import { TodoListItemType, todoListItemTypeSchema } from "@/models/tableEditor/todoList/TodoListItemType";
import { NOTES_MAX_LENGTH } from "@/services/tableEditor/todoList/constants";
import { z } from "zod";

export class TodoListItem extends AItemEntity implements ItemEntityType<TodoListItemType> {
  type = TodoListItemType.Todo;
  notes = "";
  dueAt: Date | null = null;
}

export const todoListItemSchema = aItemEntitySchema.merge(createItemEntityTypeSchema(todoListItemTypeSchema)).merge(
  z.object({
    notes: z.string().max(NOTES_MAX_LENGTH),
    dueAt: z.date().nullable(),
  }),
) satisfies z.ZodType<TodoListItem>;
