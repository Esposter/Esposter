import { z } from "zod";

export enum ItemEffectType {
  Heal = "Heal",
}

export const itemEffectTypeSchema = z.nativeEnum(ItemEffectType) satisfies z.ZodType<ItemEffectType>;
