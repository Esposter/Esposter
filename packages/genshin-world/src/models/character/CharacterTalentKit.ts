import type { Passive } from "#src/models/character/Passive";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { passiveSchema } from "#src/models/character/Passive";
import { z } from "zod";

// A character's talents as the game's tables hold them, by its id: the proud skill group of each combat talent, read off
// Its own form's skill set, the text id of each one's name, read off the same set's skill, and the passives its skill
// Depot opens
export interface CharacterTalentKit {
  characterId: number;
  passives: Passive[];
  talentGroupIds: Record<CombatTalent, number>;
  talentNames: Record<CombatTalent, { nameTextId: string }>;
}

export const characterTalentKitSchema = z.object({
  characterId: z.int().positive(),
  passives: z.array(passiveSchema),
  talentGroupIds: z.record(z.enum(CombatTalent), z.int().positive()),
  talentNames: z.record(z.enum(CombatTalent), z.object({ nameTextId: z.string().min(1) })),
}) satisfies z.ZodType<CharacterTalentKit>;
