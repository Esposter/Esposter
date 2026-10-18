import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgDealtDamage } from "#src/models/gcg/GcgDealtDamage";

import { Element, Elements } from "#src/models/Element";
import { GcgDamageKind } from "#src/models/gcg/GcgDamageKind";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

export const PARAMETRIC_TRANSFORMER_ID = 323_001;
const PARAMETRIC_TRANSFORMER_PROGRESS = 3;
const PARAMETRIC_TRANSFORMER_DICE = 3;

// Whether a hit a Skill dealt is Elemental DMG, which is neither Physical nor Piercing
const checkIsGcgElementalHit = (hit: GcgDealtDamage): boolean =>
  hit.damageType !== GcgDamageKind.Physical && hit.damageType !== GcgDamageKind.Piercing;

// Picks count different basic Elemental Dice from the duel's random source, each taken one leaving the choice
const pickGcgBasicDice = (count: number, random: () => number): Element[] => {
  const remaining = [...Elements];
  const picked: Element[] = [];
  for (let pick = 0; pick < count && remaining.length > 0; pick++) {
    const [element] = remaining.splice(Math.floor(random() * remaining.length), 1);
    if (element !== undefined) picked.push(element);
  }
  return picked;
};

// Parametric Transformer, an item: after either side uses a Skill that deals Elemental DMG, it gains 1 Qualitative Progress.
// At three it is discarded, and its side creates three different basic Elemental Dice (the wiki's Parametric Transformer)
export const parametricTransformer: GcgCardModule = {
  isSpent: (_side, zoneCard) => zoneCard.counter >= PARAMETRIC_TRANSFORMER_PROGRESS,
  onAnySkillUsed: ({ duel, sideIndex }, _skill, zoneCard, dealt) => {
    if (!dealt.some((hit) => checkIsGcgElementalHit(hit))) return;
    zoneCard.counter += 1;
    if (zoneCard.counter < PARAMETRIC_TRANSFORMER_PROGRESS) return;
    const side = takeOne(duel.sides, sideIndex);
    for (const element of pickGcgBasicDice(PARAMETRIC_TRANSFORMER_DICE, duel.random)) createGcgDice(side, element, 1);
  },
};
