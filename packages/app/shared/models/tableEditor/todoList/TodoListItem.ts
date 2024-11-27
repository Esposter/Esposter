import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { Except } from "type-fest";

import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import {
    ATableEditorItemEntity,
    aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/ATableEditorItemEntity";
import { TodoListItemType, todoListItemTypeSchema } from "#shared/models/tableEditor/todoList/TodoListItemType";
import { NOTES_MAX_LENGTH } from "#shared/services/tableEditor/todoList/constants";
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
  ) satisfies z.ZodType<Except<TodoListItem, "toJSON">>;
