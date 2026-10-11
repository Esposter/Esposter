import type { AttributeLine } from "#src/models/character/AttributeLine";

import { attributeLineSchema } from "#src/models/character/AttributeLine";
import { z } from "zod";

// What a set gives once a character wears this many of its pieces: the attributes it adds, and the numbers its effect
// That waits on a condition reads, in the set table's order, none for a bonus that is only attributes. An effect that
// Waits on a condition is never a line here, but a module of its set's over those numbers
export interface ArtifactSetBonus {
  attributeLines: AttributeLine[];
  params: number[];
  pieceCount: number;
}

export const artifactSetBonusSchema = z.object({
  attributeLines: z.array(attributeLineSchema),
  params: z.array(z.number()),
  pieceCount: z.int().positive(),
}) satisfies z.ZodType<ArtifactSetBonus>;
