import { z } from "zod";

export enum ItemId {
  Potion = "Potion",
}

export const itemIdSchema = z.nativeEnum(ItemId) satisfies z.ZodType<ItemId>;
