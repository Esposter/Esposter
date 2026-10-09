import type { TalentMultiplier } from "#src/models/character/TalentMultiplier";

import { talentMultiplierSchema } from "#src/models/character/TalentMultiplier";
import { z } from "zod";

// Each combat talent's multipliers keyed by its proud skill group's id, the game's own, its levels from 1 up
export type TalentMultiplierMap = Readonly<Record<string, readonly TalentMultiplier[]>>;

export const talentMultiplierMapSchema = z.record(
  z.string(),
  z.array(talentMultiplierSchema),
) satisfies z.ZodType<TalentMultiplierMap>;
