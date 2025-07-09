import { z } from "zod";

export enum ItemEffectType {
  Capture = "Capture",
  Heal = "Heal",
}

export const itemEffectTypeSchema = z.enum(ItemEffectType) satisfies z.ZodType<ItemEffectType>;
