import type { TalentLabel } from "#src/models/character/TalentLabel";

import { talentLabelSchema } from "#src/models/character/TalentLabel";
import { z } from "zod";

// Each combat talent's labels keyed by its proud skill group's id, the game's own, its levels from 1 up
export type TalentLabelMap = Readonly<Record<string, readonly TalentLabel[]>>;

export const talentLabelMapSchema = z.record(
  z.string(),
  z.array(talentLabelSchema),
) satisfies z.ZodType<TalentLabelMap>;
