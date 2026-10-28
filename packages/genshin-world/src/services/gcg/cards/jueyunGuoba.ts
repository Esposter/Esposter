import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { JUEYUN_GUOBA_ID } from "#src/services/gcg/cards/constants";
import { addGcgZoneCardToCharacter } from "#src/services/gcg/effects/addGcgZoneCardToCharacter";
import { checkIsGcgFoodEatable } from "#src/services/gcg/effects/checkIsGcgFoodEatable";

// Jueyun Guoba: the target character's next Normal Attack this round deals one DMG more, and a character eats one food a
// Round
export const jueyunGuoba: GcgCardModule = {
  canPlay: ({ duel, sideIndex }, targetIndex) => checkIsGcgFoodEatable(duel, sideIndex, targetIndex),
  initialRounds: 1,
  initialUsages: 1,
  modifyDamageDealt: (context, damage, zoneCard) => {
    if (context.skill?.kind !== GcgSkillKind.NormalAttack || zoneCard.usages <= 0) return damage;
    zoneCard.usages = 0;
    return { ...damage, value: damage.value + 1 };
  },
  play: (context, targetIndex) => {
    addGcgZoneCardToCharacter(context, targetIndex, JUEYUN_GUOBA_ID, jueyunGuoba);
  },
};
