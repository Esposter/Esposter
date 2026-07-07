import type { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import type { ToData } from "@esposter/shared";

import { todoListItemSchema } from "#shared/models/tableEditor/todoList/TodoListItem";
import { TABLE_EDITOR_ITEMS_MAX_LENGTH } from "#shared/services/tableEditor/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface TodoListResource {
  items: ToData<TodoListItem>[];
}

export const todoListResourceSchema = z.object({
  items: createUniqueArraySchema(todoListItemSchema, "id").max(TABLE_EDITOR_ITEMS_MAX_LENGTH),
}) satisfies z.ZodType<TodoListResource>;
