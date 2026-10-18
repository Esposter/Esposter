import type { AttributeLine } from "#src/models/character/AttributeLine";

import { attributeLineSchema } from "#src/models/character/AttributeLine";
import { z } from "zod";

// What a set gives once a character wears this many of its pieces: the attributes it adds, and the numbers its effect
// That waits on a condition reads, in the set table's order, none for a bonus that is only attributes. An effect that
// Waits on a condition is never a line here, but a module of its set's over those numbers. The text hash of the game's
// Words for the effect is the names record's key for them, and empty where its affix holds none
export interface ArtifactSetBonus {
  attributeLines: AttributeLine[];
  descriptionTextHash: string;
  params: number[];
  pieceCount: number;
}

export const artifactSetBonusSchema = z.object({
  attributeLines: z.array(attributeLineSchema),
  descriptionTextHash: z.string(),
  params: z.array(z.number()),
  pieceCount: z.int().positive(),
}) satisfies z.ZodType<ArtifactSetBonus>;
