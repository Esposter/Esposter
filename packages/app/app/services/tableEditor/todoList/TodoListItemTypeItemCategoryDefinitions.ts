import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { Except } from "type-fest";

import { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import { TodoListItemType } from "#shared/models/tableEditor/todoList/TodoListItemType";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";
import { prettify } from "@/util/text/prettify";
import { ItemEntityTypePropertyNames } from "@esposter/shared";

const TodoListItemTypeItemCategoryDefinitionMap = {
  [TodoListItemType.Todo]: {
    create: () => new TodoListItem(),
    icon: "mdi-check",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: prettify(TodoListItemType.Todo),
  },
} as const satisfies Record<TodoListItemType, Except<ItemCategoryDefinition<TodoListItem>, "value">>;

export const TodoListItemTypeItemCategoryDefinitions: ItemCategoryDefinition<TodoListItem>[] = parseDictionaryToArray(
  TodoListItemTypeItemCategoryDefinitionMap,
  "value",
);
