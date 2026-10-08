import type { ArtifactMinorAffixGroup } from "#src/models/artifact/ArtifactMinorAffixGroup";

import { artifactMinorAffixGroupSchema } from "#src/models/artifact/ArtifactMinorAffixGroup";
import { z } from "zod";

// What every artifact of a rarity shares, as the game's tables give it: its highest level, the EXP each level costs to
// Leave, its base EXP as fodder, the levels at which a minor affix is added or raised, and the minor affixes it may roll
export interface ArtifactRarityData {
  affixLevels: number[];
  baseExperience: number;
  levelExperiences: number[];
  maxLevel: number;
  minorAffixGroups: ArtifactMinorAffixGroup[];
  rarity: number;
}

export const artifactRarityDataSchema = z.object({
  affixLevels: z.array(z.int().nonnegative()),
  baseExperience: z.int().nonnegative(),
  levelExperiences: z.array(z.int().positive()),
  maxLevel: z.int().nonnegative(),
  minorAffixGroups: z.array(artifactMinorAffixGroupSchema),
  rarity: z.int().min(1).max(5),
}) satisfies z.ZodType<ArtifactRarityData>;
