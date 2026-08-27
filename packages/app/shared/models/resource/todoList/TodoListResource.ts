import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { ToData } from "@esposter/shared";

import { todoListItemSchema } from "#shared/models/resource/todoList/TodoListItem";
import { RESOURCE_ITEMS_MAX_LENGTH } from "#shared/services/resource/item/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface TodoListResource {
  items: TodoListItem[];
}

export const todoListResourceSchema = z.object({
  items: createUniqueArraySchema(todoListItemSchema, "id").max(RESOURCE_ITEMS_MAX_LENGTH),
}) satisfies z.ZodType<ToData<TodoListResource>>;
