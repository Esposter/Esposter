import { CombatTalent } from "#src/models/character/CombatTalent";
import { z } from "zod";

// One of a character's constellations as the game's table holds it: its name and description by text id, its numbers,
// And, on the third and fifth only, the combat talent it raises and by how many levels
export interface Constellation {
  descriptionTextId: string;
  nameTextId: string;
  paramList: number[];
  raise?: { levels: number; talent: CombatTalent };
}

export const constellationSchema = z.object({
  descriptionTextId: z.string().nonempty(),
  nameTextId: z.string().nonempty(),
  paramList: z.array(z.number()),
  raise: z.object({ levels: z.int().positive(), talent: z.enum(CombatTalent) }).optional(),
}) satisfies z.ZodType<Constellation>;
