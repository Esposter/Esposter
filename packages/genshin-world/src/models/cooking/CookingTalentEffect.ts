import { z } from "zod";

// What a cooking talent adds to a dish when its chance draw succeeds: one more of the dish made when it is Delicious, or one
// More of a Suspicious dish when that is what was made
export const CookingTalentEffect = { DoubleProduct: "DoubleProduct", SuspiciousDish: "SuspiciousDish" } as const;
export type CookingTalentEffect = (typeof CookingTalentEffect)[keyof typeof CookingTalentEffect];

export const cookingTalentEffectSchema = z.enum(CookingTalentEffect) satisfies z.ZodType<CookingTalentEffect>;
