import type { SoundEffect } from "genshin-engine";

import { z } from "zod";

// The login's sounds by their names: the door's, as its two channels and the noise they share hold it over time
export interface LoginSounds {
  door: SoundEffect;
}

const soundEffectSchema = z.object({
  frameSeconds: z.number().positive(),
  leftLevels: z.array(z.array(z.number().nonnegative())),
  rightLevels: z.array(z.array(z.number().nonnegative())),
  sharedLevels: z.array(z.array(z.number().nonnegative())),
}) satisfies z.ZodType<SoundEffect>;

export const loginSoundsSchema = z.object({ door: soundEffectSchema }) satisfies z.ZodType<LoginSounds>;
