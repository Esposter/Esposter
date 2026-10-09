import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";

import { healGcgCharacter } from "#src/services/gcg/effects/healGcgCharacter";
import { takeOne } from "@esposter/shared";

const WANGSHU_INN_HEAL = 2;

// Wangshu Inn: at the end phase the most injured standby character heals for two HP, for two usages
export const wangshuInn: GcgCardModule = {
  initialUsages: 2,
  onEndPhase: ({ duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    const injuredStandbyCharacters = side.characters.filter(
      (character, index) => index !== side.activeIndex && character.hp > 0 && character.hp < character.character.hp,
    );
    const [mostInjuredCharacter] = injuredStandbyCharacters.toSorted(
      (firstCharacter, secondCharacter) => getMissingHp(secondCharacter) - getMissingHp(firstCharacter),
    );
    if (mostInjuredCharacter) healGcgCharacter(mostInjuredCharacter, WANGSHU_INN_HEAL);
    zoneCard.usages -= 1;
  },
};

const getMissingHp = (character: GcgCharacterState): number => character.character.hp - character.hp;
