import type { Type } from "arktype";

import { type } from "arktype";

export enum TodoListItemType {
  Todo = "Todo",
}

export const todoListItemTypeSchema = type.valueOf(TodoListItemType) satisfies Type<TodoListItemType>;
