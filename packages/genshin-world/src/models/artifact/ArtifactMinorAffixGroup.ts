import { Attribute } from "#src/models/character/Attribute";
import { z } from "zod";

// One minor affix an artifact of a rarity can roll, with every tier of its value the game's table holds for that rarity,
// Each tier as likely as the next to be the one it rolls
export interface ArtifactMinorAffixGroup {
  attribute: Attribute;
  values: number[];
}

export const artifactMinorAffixGroupSchema = z.object({
  attribute: z.enum(Attribute),
  values: z.array(z.number()).min(1),
}) satisfies z.ZodType<ArtifactMinorAffixGroup>;
