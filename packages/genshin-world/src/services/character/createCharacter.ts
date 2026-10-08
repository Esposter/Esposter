import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";

import { CombatTalent } from "#src/models/character/CombatTalent";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A character as the game gives one: at level 1 in its first phase, every combat talent at its first level, wielding the
// Weapon it comes with at the weapon's level 1, and wearing no artifacts
export const createCharacter = (id: number, characterDataMap: ReadonlyMap<number, CharacterData>): Character => {
  const characterData = characterDataMap.get(id);
  if (!characterData) throw new InvalidOperationError(Operation.Create, createCharacter.name, `character ${id}`);
  return {
    artifacts: [],
    ascension: 0,
    id,
    level: 1,
    talentLevels: {
      [CombatTalent.ElementalBurst]: TALENT_START_LEVEL,
      [CombatTalent.ElementalSkill]: TALENT_START_LEVEL,
      [CombatTalent.NormalAttack]: TALENT_START_LEVEL,
    },
    weapon: { ascension: 0, experience: 0, id: characterData.initialWeaponId, level: 1, refinement: 1 },
  };
};
