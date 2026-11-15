import { z } from "zod";

export const ItemEffectType = { Capture: "Capture", Heal: "Heal" } as const;
export type ItemEffectType = (typeof ItemEffectType)[keyof typeof ItemEffectType];

export const itemEffectTypeSchema = z.enum(ItemEffectType) satisfies z.ZodType<ItemEffectType>;
