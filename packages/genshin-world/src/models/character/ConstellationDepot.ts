import type { Constellation } from "#src/models/character/Constellation";

import { constellationSchema } from "#src/models/character/Constellation";
import { z } from "zod";

// The Stella Fortuna a set's constellations spend, one each: the game's id for its item, and the text id of its name, which
// The names are read by. Every constellation of a set spends the one item
export interface StellaFortuna {
  itemId: number;
  nameTextId: string;
}

// The constellations of one of a character's skill sets, by its depot id, in the order the game activates them: the
// Traveler's sets are one each per element, and a character with one set has the one depot
export interface ConstellationDepot {
  constellations: Constellation[];
  depotId: number;
  stellaFortuna: StellaFortuna;
}

export const stellaFortunaSchema = z.object({
  itemId: z.int().positive(),
  nameTextId: z.string(),
}) satisfies z.ZodType<StellaFortuna>;

export const constellationDepotSchema = z.object({
  constellations: z.array(constellationSchema),
  depotId: z.int().positive(),
  stellaFortuna: stellaFortunaSchema,
}) satisfies z.ZodType<ConstellationDepot>;
