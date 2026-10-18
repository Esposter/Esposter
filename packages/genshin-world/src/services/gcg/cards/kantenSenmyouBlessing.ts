import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { CRYO_ELEMENTAL_INFUSION_ID } from "#src/services/gcg/cards/cryoElementalInfusion";
import { takeOne } from "@esposter/shared";

export const KANTEN_SENMYOU_BLESSING_ID = 211_051;
const KANTEN_SENMYOU_BLESSING_DAMAGE_BONUS = 1;

// Kanten Senmyou Blessing, Kamisato Ayaka's equipment: while she holds Cryo Elemental Infusion, she deals +1 Cryo DMG (the
// Wiki's Kanten Senmyou Blessing (Equipment Card)). Only the active character's equipment is listed, so the active
// Character is the one it is attached to. Its other clause, the switch to her costing one die less once per Round, is not
// Built: a switch's cost is paid through the character leaving, so the reduction has no hook for the one coming in
export const kantenSenmyouBlessing: GcgCardModule = {
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
