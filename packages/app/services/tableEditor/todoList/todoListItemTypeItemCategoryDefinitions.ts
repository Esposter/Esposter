import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { TodoListItemType } from "@/models/tableEditor/todoList/TodoListItemType";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import { prettifyName } from "@/util/text/prettifyName";
import type { Except } from "type-fest";

const todoListItemTypeItemCategoryDefinitionMap = {
  [TodoListItemType.Todo]: {
    title: prettifyName(TodoListItemType.Todo),
    icon: "mdi-check",
    targetTypeKey: "type",
    create: () => new TodoListItem(),
  },
} as const satisfies Record<TodoListItemType, Except<ItemCategoryDefinition<TodoListItem>, "value">>;

export const todoListItemTypeItemCategoryDefinitions: ItemCategoryDefinition<TodoListItem>[] = parseDictionaryToArray(
  todoListItemTypeItemCategoryDefinitionMap,
  "value",
);
