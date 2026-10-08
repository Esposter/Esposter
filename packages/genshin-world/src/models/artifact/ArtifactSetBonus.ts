import type { AttributeLine } from "#src/models/character/AttributeLine";

import { attributeLineSchema } from "#src/models/character/AttributeLine";
import { z } from "zod";

// What a set gives once a character wears this many of its pieces, as far as it is attributes: an effect that waits on
// A condition is the set's description, never a line here
export interface ArtifactSetBonus {
  attributeLines: AttributeLine[];
  pieceCount: number;
}

export const artifactSetBonusSchema = z.object({
  attributeLines: z.array(attributeLineSchema),
  pieceCount: z.int().positive(),
}) satisfies z.ZodType<ArtifactSetBonus>;
