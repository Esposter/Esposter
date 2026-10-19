import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { cryoElementalInfusion } from "#src/services/gcg/cards/cryoElementalInfusion";
import { CRYO_ELEMENTAL_INFUSION_ID, SENHO_STATUS_ID } from "#src/services/gcg/cards/constants";
import { countGcgCardUses } from "#src/services/gcg/effects/countGcgCardUses";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

// The id Kamisato Art: Senho's status is held under: the passive's own skill id, since the dump names no card for it
const SENHO_TRIGGERS_PER_ROUND = 2;
const SENHO_BONUS = 1;

// Kamisato Art: Senho, Ayaka's passive: when she is switched to be the active character, she gains Cryo Elemental Infusion,
// And her next Normal Attack this Round deals 1 more DMG. It triggers twice per Round (the wiki's Kamisato Art: Senho)
export const kamisatoArtSenho: GcgCardModule = {
  modifyDamageDealt: (context, damage, zoneCard) => {
    if (zoneCard.usages <= 0 || context.skill?.kind !== GcgSkillKind.NormalAttack) return damage;
    zoneCard.usages = 0;
    return { ...damage, value: damage.value + SENHO_BONUS };
  },
  onSwitch: ({ characterIndex, duel, sideIndex }, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    if (characterIndex === undefined || characterIndex !== side.activeIndex) return;
    if (countGcgCardUses(side, SENHO_STATUS_ID) >= SENHO_TRIGGERS_PER_ROUND) return;
    side.usedCardIds.push(SENHO_STATUS_ID);
    zoneCard.usages = 1;
    const character = takeOne(side.characters, characterIndex);
    placeGcgZoneCard(character.statuses, CRYO_ELEMENTAL_INFUSION_ID, cryoElementalInfusion);
  },
};
