import type { TalentUpgrade } from "#src/models/character/TalentUpgrade";

import { talentUpgradeSchema } from "#src/models/character/TalentUpgrade";
import { z } from "zod";

// Each combat talent's upgrades keyed by its proud skill group's id, the game's own. A talent starts at its first level,
// So the upgrades begin at the second
export type TalentUpgradeMap = Readonly<Record<string, readonly TalentUpgrade[]>>;

export const talentUpgradeMapSchema = z.record(
  z.string(),
  z.array(talentUpgradeSchema),
) satisfies z.ZodType<TalentUpgradeMap>;
