import type { ConstellationDepot } from "#src/models/character/ConstellationDepot";

import { constellationDepotSchema } from "#src/models/character/ConstellationDepot";
import { z } from "zod";

// A character's constellations as the game's tables hold them, by its id, one depot for each skill set that has any.
// A character none of whose sets has a constellation, Aloy among them, has no kit here and none to activate
export interface CharacterConstellationKit {
  characterId: number;
  depots: ConstellationDepot[];
}

export const characterConstellationKitSchema = z.object({
  characterId: z.int().positive(),
  depots: z.array(constellationDepotSchema),
}) satisfies z.ZodType<CharacterConstellationKit>;
