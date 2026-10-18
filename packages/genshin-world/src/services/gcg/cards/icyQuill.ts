import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { MYSTICAL_ABANDON_ID } from "#src/services/gcg/cards/mysticalAbandon";
import { countGcgCardUses } from "#src/services/gcg/effects/countGcgCardUses";
import { takeOne } from "@esposter/shared";

export const ICY_QUILL_ID = 111_071;
const ICY_QUILL_BONUS = 1;

// Icy Quill, the onstage Spring Spirit Summoning creates: her character deals 1 more Cryo DMG, for two usages. With Mystical
// Abandon equipped to a character of its side, its first Normal Attack each Round spends no usage. Its Swirl-triggered DMG
// is not yet raised, as a Swirl spreads outside the damage a skill deals
export const icyQuill: GcgCardModule = {
  initialUsages: 2,
  modifyDamageDealt: (context, damage, zoneCard) => {
    if (damage.damageType !== Element.Cryo || zoneCard.usages <= 0) return damage;
    const side = takeOne(context.duel.sides, context.sideIndex);
    const isFreeUse =
      context.skill?.kind === GcgSkillKind.NormalAttack &&
      countGcgCardUses(side, ICY_QUILL_ID) === 0 &&
      side.characters.some(({ equipments }) => equipments.some(({ cardId }) => cardId === MYSTICAL_ABANDON_ID));
    if (isFreeUse) side.usedCardIds.push(ICY_QUILL_ID);
    else zoneCard.usages -= 1;
    return { ...damage, value: damage.value + ICY_QUILL_BONUS };
  },
};
