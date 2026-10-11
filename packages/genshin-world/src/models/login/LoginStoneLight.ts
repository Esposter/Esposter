import type { StoneLight } from "genshin-engine";

import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import { STONE_HARMONIC_COUNT, STONE_RAMP_KNOT_COUNT } from "genshin-engine";
import { z } from "zod";

// The stone's light at each of the login's four hours, as the game's deferred pass casts it on its stone
export type LoginStoneLight = Record<LoginTimeOfDay, StoneLight>;

const stoneLightSchema = z.object({
  harmonics: z.array(z.array(z.number()).length(3)).length(STONE_HARMONIC_COUNT),
  hazeColor: z.array(z.number()).length(3),
  hazeScatterColor: z.array(z.number()).length(3),
  heightDarkening: z.number(),
  heightFade: z.array(z.number()).length(3),
  ramp: z.array(z.array(z.number()).length(3)).length(STONE_RAMP_KNOT_COUNT),
}) satisfies z.ZodType<StoneLight>;

export const loginStoneLightSchema = z.object({
  [LoginTimeOfDay.Dawn]: stoneLightSchema,
  [LoginTimeOfDay.Day]: stoneLightSchema,
  [LoginTimeOfDay.Dusk]: stoneLightSchema,
  [LoginTimeOfDay.Night]: stoneLightSchema,
}) satisfies z.ZodType<LoginStoneLight>;
