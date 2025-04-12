import type { Type } from "arktype";

import { type } from "arktype";

export enum ItemType {
  Building = "Building",
  Mouse = "Mouse",
  Upgrade = "Upgrade",
}

export const itemTypeSchema = type.valueOf(ItemType) satisfies Type<ItemType>;
