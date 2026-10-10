import type { StoneMaterialOptions } from "genshin-engine";

import { z } from "zod";

// The login's stone by family, each as its game material holds it: the bridges', the door's frame and its panel, the
// Towers' and the walkway's
export interface LoginStone {
  bridges: StoneMaterialOptions;
  door: StoneMaterialOptions;
  doorPanel: StoneMaterialOptions;
  towers: StoneMaterialOptions;
  walkway: StoneMaterialOptions;
}

const HEX_COLOR_REGEX = /^#[\da-f]{6}$/iu;

const stoneMaterialOptionsSchema = z.object({
  albedo: z.string().regex(HEX_COLOR_REGEX),
  glowRange: z.number().nonnegative(),
  rimColor: z.array(z.number()).length(3),
  rimPower: z.number().nonnegative(),
  rimStrength: z.number().nonnegative(),
  smoothness: z.number().nonnegative(),
  specularColor: z.array(z.number()).length(3),
}) satisfies z.ZodType<StoneMaterialOptions>;

export const loginStoneSchema = z.object({
  bridges: stoneMaterialOptionsSchema,
  door: stoneMaterialOptionsSchema,
  doorPanel: stoneMaterialOptionsSchema,
  towers: stoneMaterialOptionsSchema,
  walkway: stoneMaterialOptionsSchema,
}) satisfies z.ZodType<LoginStone>;
