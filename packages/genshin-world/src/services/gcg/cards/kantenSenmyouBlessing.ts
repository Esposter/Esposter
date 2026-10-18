import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { CRYO_ELEMENTAL_INFUSION_ID } from "#src/services/gcg/cards/cryoElementalInfusion";
import { checkIsGcgSwitchCost } from "#src/services/gcg/effects/checkIsGcgSwitchCost";
import { takeOne } from "@esposter/shared";

export const KANTEN_SENMYOU_BLESSING_ID = 211_051;
const KANTEN_SENMYOU_BLESSING_DAMAGE_BONUS = 1;

// Kanten Senmyou Blessing, Kamisato Ayaka's equipment: while she holds Cryo Elemental Infusion, she deals +1 Cryo DMG, and
// When she is switched to, the switch costs one die less, once per Round (the wiki's Kanten Senmyou Blessing (Equipment
// Card)). Only the active character's equipment is listed for DMG, so the active character is the one it is attached to
export const kantenSenmyouBlessing: GcgCardModule = {
  onCostPaid: ({ duel, sideIndex }, subject) => {
    if (checkIsGcgSwitchCost(subject)) takeOne(duel.sides, sideIndex).usedCardIds.push(KANTEN_SENMYOU_BLESSING_ID);
  },
  reduceCost: ({ characterIndex, duel, sideIndex }, subject) =>
    checkIsGcgSwitchCost(subject) &&
    subject.switchTo === characterIndex &&
    !takeOne(duel.sides, sideIndex).usedCardIds.includes(KANTEN_SENMYOU_BLESSING_ID)
      ? { count: 1, element: undefined }
      : undefined,
  modifyDamageDealt: ({ duel, sideIndex }, damage) => {
    const side = takeOne(duel.sides, sideIndex);
    if (
      !takeOne(side.characters, side.activeIndex).statuses.some(({ cardId }) => cardId === CRYO_ELEMENTAL_INFUSION_ID)
    )
      return damage;
    if (damage.damageType !== GcgDamageKind.Physical && damage.damageType !== Element.Cryo) return damage;
    return { ...damage, value: damage.value + KANTEN_SENMYOU_BLESSING_DAMAGE_BONUS };
  },
};
