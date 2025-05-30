import { z } from "zod/v4";

export enum TodoListItemType {
  Todo = "Todo",
}

export const todoListItemTypeSchema = z.enum(TodoListItemType) satisfies z.ZodType<TodoListItemType>;
