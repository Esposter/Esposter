import { z } from "zod";

export enum TodoListItemType {
  Todo = "Todo",
}

export const todoListItemTypeSchema = z.nativeEnum(TodoListItemType) satisfies z.ZodType<TodoListItemType>;
