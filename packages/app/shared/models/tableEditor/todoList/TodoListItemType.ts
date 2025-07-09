import { z } from "zod";

export enum TodoListItemType {
  Todo = "Todo",
}

export const todoListItemTypeSchema = z.enum(TodoListItemType) satisfies z.ZodType<TodoListItemType>;
