import { z } from "zod";

export enum ItemType {
  Building = "Building",
  Mouse = "Mouse",
  Upgrade = "Upgrade",
}

export const itemTypeSchema = z.enum(ItemType) satisfies z.ZodType<ItemType>;
