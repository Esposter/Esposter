import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { listGcgTechniques } from "#src/services/gcg/effects/listGcgTechniques";

// The Technique a character's equipment gives it, by its skill id
export const findGcgTechnique = (character: GcgCharacterState, skillId: number): GcgSkill | undefined =>
  listGcgTechniques(character).find(({ id }) => id === skillId);
