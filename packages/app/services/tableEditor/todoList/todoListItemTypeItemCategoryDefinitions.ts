import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { Except } from "type-fest";

import { TodoListItem } from "@/shared/models/tableEditor/todoList/TodoListItem";
import { TodoListItemType } from "@/shared/models/tableEditor/todoList/TodoListItemType";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import { prettify } from "@/util/text/prettify";

const todoListItemTypeItemCategoryDefinitionMap = {
  [TodoListItemType.Todo]: {
    create: () => new TodoListItem(),
    icon: "mdi-check",
    targetTypeKey: "type",
    title: prettify(TodoListItemType.Todo),
  },
} as const satisfies Record<TodoListItemType, Except<ItemCategoryDefinition<TodoListItem>, "value">>;

export const todoListItemTypeItemCategoryDefinitions: ItemCategoryDefinition<TodoListItem>[] = parseDictionaryToArray(
  todoListItemTypeItemCategoryDefinitionMap,
  "value",
);
