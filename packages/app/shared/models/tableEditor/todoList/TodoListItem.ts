import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { ToData } from "#shared/models/entity/ToData";
import type { Type } from "arktype";

import { createItemEntityTypeSchema } from "#shared/models/entity/ItemEntityType";
import {
  ATableEditorItemEntity,
  aTableEditorItemEntitySchema,
} from "#shared/models/tableEditor/ATableEditorItemEntity";
import { TodoListItemType, todoListItemTypeSchema } from "#shared/models/tableEditor/todoList/TodoListItemType";
import { NOTES_MAX_LENGTH } from "#shared/services/tableEditor/todoList/constants";
import { type } from "arktype";

export class TodoListItem extends ATableEditorItemEntity implements ItemEntityType<TodoListItemType> {
  dueAt: Date | null = null;
  notes = "";
  type = TodoListItemType.Todo;
}

export const todoListItemSchema = aTableEditorItemEntitySchema
  .merge(createItemEntityTypeSchema(todoListItemTypeSchema))
  .merge(
    type({
      dueAt: "Date | null",
      notes: `string <= ${NOTES_MAX_LENGTH}`,
    }),
  ) satisfies Type<ToData<TodoListItem>>;
