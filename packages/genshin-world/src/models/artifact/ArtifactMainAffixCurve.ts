import { Attribute } from "#src/models/character/Attribute";
import { z } from "zod";

// What a main affix raises its attribute by on an artifact of this rarity, at each enhancement level from 0
export interface ArtifactMainAffixCurve {
  attribute: Attribute;
  rarity: number;
  values: number[];
}

export const artifactMainAffixCurveSchema = z.object({
  attribute: z.enum(Attribute),
  rarity: z.int().min(1).max(5),
  values: z.array(z.number()).min(1),
}) satisfies z.ZodType<ArtifactMainAffixCurve>;
