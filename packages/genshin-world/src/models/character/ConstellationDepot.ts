import type { Constellation } from "#src/models/character/Constellation";

import { constellationSchema } from "#src/models/character/Constellation";
import { z } from "zod";

// The constellations of one of a character's skill sets, by its depot id, in the order the game activates them: the
// Traveler's sets are one each per element, and a character with one set has the one depot
export interface ConstellationDepot {
  constellations: Constellation[];
  depotId: number;
}

export const constellationDepotSchema = z.object({
  constellations: z.array(constellationSchema),
  depotId: z.int().positive(),
}) satisfies z.ZodType<ConstellationDepot>;
