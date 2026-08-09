import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { ItemCategoryDefinition } from "@/models/resource/ItemCategoryDefinition";
import type { Except } from "type-fest";

import { TodoListItemType } from "#shared/models/resource/todoList/TodoListItemType";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";
import { prettify } from "@/util/text/prettify";
import { ItemEntityTypePropertyNames } from "@esposter/shared";

const TodoListItemTypeItemCategoryDefinitionMap = {
  [TodoListItemType.Todo]: {
    icon: "mdi-check",
    targetTypeKey: ItemEntityTypePropertyNames.type,
    title: prettify(TodoListItemType.Todo),
  },
} as const satisfies Record<TodoListItemType, Except<ItemCategoryDefinition<TodoListItem>, "value">>;

export const TodoListItemTypeItemCategoryDefinitions: ItemCategoryDefinition<TodoListItem>[] = parseDictionaryToArray(
  TodoListItemTypeItemCategoryDefinitionMap,
  "value",
);
