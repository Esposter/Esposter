import type { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { TodoListItemType } from "@/models/tableEditor/todoList/TodoListItemType";

export const todoListItemCategoryDefinitions: ItemCategoryDefinition<TodoListItemType>[] = [
  {
    value: TodoListItemType.Todo,
    title: prettifyName(TodoListItemType.Todo),
    icon: "mdi-check",
    targetTypeKey: "type",
    create: () => new TodoListItem(),
  },
];
