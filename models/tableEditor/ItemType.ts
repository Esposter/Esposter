import { z } from "zod";

export enum ItemType {
  VuetifyComponent = "VuetifyComponent",
  TodoList = "TodoList",
}

export const itemTypeSchema = z.nativeEnum(ItemType) satisfies z.ZodType<ItemType>;
