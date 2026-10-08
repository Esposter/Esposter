import type { SkillDepot } from "#src/models/character/SkillDepot";

import { skillDepotSchema } from "#src/models/character/SkillDepot";
import { z } from "zod";

// A character's skill sets as the game's tables hold them, by its id: the set its own form starts in, then the set of
// Each element form it may take, the one a statue's element picks
export interface CharacterSkillKit {
  characterId: number;
  depots: SkillDepot[];
}

export const characterSkillKitSchema = z.object({
  characterId: z.int().positive(),
  depots: z.array(skillDepotSchema),
}) satisfies z.ZodType<CharacterSkillKit>;
