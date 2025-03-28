import { z } from "zod";

export enum ItemEffectType {
  Capture = "Capture",
  Heal = "Heal",
}

export const itemEffectTypeSchema = z.nativeEnum(ItemEffectType) as const satisfies z.ZodType<ItemEffectType>;
