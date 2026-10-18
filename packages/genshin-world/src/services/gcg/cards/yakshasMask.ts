import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { checkIsGcgSwitchCost } from "#src/services/gcg/effects/checkIsGcgSwitchCost";
import { takeOne } from "@esposter/shared";

export const YAKSHAS_MASK_ID = 115_041;
const YAKSHAS_MASK_ROUNDS = 2;
// Its usages are the Lemniscatic Wind Cycling reductions each attachment of the mask allows Conqueror of Evil: Guardian Yaksha
const YAKSHAS_MASK_USAGES = 2;
const YAKSHAS_MASK_DAMAGE_BONUS = 1;
const YAKSHAS_MASK_PLUNGE_BONUS = 2;

// Yaksha's Mask, the status Bane of All Evil attaches to Xiao for two Rounds: while she is active, her Physical DMG is dealt
// as Anemo and her Anemo DMG is 1 more, her Plunging Attack 2 more still, and a switch away from her costs one die less,
// once per Round (the wiki's Yaksha's Mask)
export const yakshasMask: GcgCardModule = {
  initialRounds: YAKSHAS_MASK_ROUNDS,
  initialUsages: YAKSHAS_MASK_USAGES,
  modifyDamageDealt: ({ isPlunge }, damage) => {
    const dealt = damage.damageType === GcgDamageKind.Physical ? { ...damage, damageType: Element.Anemo } : damage;
    const bonus =
      (dealt.damageType === Element.Anemo ? YAKSHAS_MASK_DAMAGE_BONUS : 0) + (isPlunge ? YAKSHAS_MASK_PLUNGE_BONUS : 0);
    return { ...dealt, value: dealt.value + bonus };
  },
  onCostPaid: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).usedCardIds.push(YAKSHAS_MASK_ID);
  },
  reduceCost: ({ characterIndex, duel, sideIndex }, subject) => {
    const side = takeOne(duel.sides, sideIndex);
    return checkIsGcgSwitchCost(subject) &&
      characterIndex === side.activeIndex &&
      !side.usedCardIds.includes(YAKSHAS_MASK_ID)
      ? { count: 1 }
      : undefined;
  },
};
