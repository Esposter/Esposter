import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";

// The Techniques a character's equipment gives it, in the order its equipment holds them: a combat action of the card's own,
// Used by the character the card is equipped to and read beside the character's skills
export const listGcgTechniques = (character: GcgCharacterState): GcgSkill[] =>
  character.equipments.flatMap(({ cardId }) => GcgCardIdModuleMap.get(cardId)?.skills ?? []);
