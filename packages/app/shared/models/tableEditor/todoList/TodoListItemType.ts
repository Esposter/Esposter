import { z } from "zod";

export enum TodoListItemType {
  Todo = "Todo",
}

export const todoListItemTypeSchema = z.nativeEnum(TodoListItemType) as const satisfies z.ZodType<TodoListItemType>;
