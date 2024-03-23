import { z } from "zod";

export enum ItemType {
  Upgrade = "Upgrade",
  Building = "Building",
  Mouse = "Mouse",
}

export const itemTypeSchema = z.nativeEnum(ItemType) satisfies z.ZodType<ItemType>;
