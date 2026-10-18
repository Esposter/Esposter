import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";

import { GcgCardIdModuleMap } from "#src/services/gcg/cards/gcgCardIdModuleMap";

// The Technique a character's equipment gives it, by its skill id: a combat action of the card's own, used by the character
// The card is equipped to, and read beside the character's skills
export const findGcgTechnique = (character: GcgCharacterState, skillId: number): GcgSkill | undefined => {
  for (const zoneCard of character.equipments) {
    const skill = GcgCardIdModuleMap.get(zoneCard.cardId)?.skills?.find(({ id }) => id === skillId);
    if (skill) return skill;
  }
  return undefined;
};
