import { z } from "zod/v4";

export enum ItemEffectType {
  Capture = "Capture",
  Heal = "Heal",
}

export const itemEffectTypeSchema = z.enum(ItemEffectType) satisfies z.ZodType<ItemEffectType>;
