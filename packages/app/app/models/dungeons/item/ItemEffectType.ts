import type { Type } from "arktype";

import { type } from "arktype";

export enum ItemEffectType {
  Capture = "Capture",
  Heal = "Heal",
}

export const itemEffectTypeSchema = type.valueOf(ItemEffectType) satisfies Type<ItemEffectType>;
