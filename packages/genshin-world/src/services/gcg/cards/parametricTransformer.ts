import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { checkIsGcgElementalHit } from "#src/services/gcg/cards/checkIsGcgElementalHit";
import { pickGcgBasicDice } from "#src/services/gcg/cards/pickGcgBasicDice";
import { createGcgDice } from "#src/services/gcg/effects/createGcgDice";
import { takeOne } from "@esposter/shared";

const PARAMETRIC_TRANSFORMER_PROGRESS = 3;
const PARAMETRIC_TRANSFORMER_DICE = 3;

// Parametric Transformer, an item: after either side uses a Skill that deals Elemental DMG, it gains 1 Qualitative Progress.
// At three it is discarded, and its side creates three different basic Elemental Dice (the wiki's Parametric Transformer)
export const parametricTransformer: GcgCardModule = {
  checkIsSpent: (_side, zoneCard) => zoneCard.counter >= PARAMETRIC_TRANSFORMER_PROGRESS,
  onAnySkillUsed: ({ duel, sideIndex }, _skill, zoneCard, dealt) => {
    if (!dealt.some((hit) => checkIsGcgElementalHit(hit))) return;
    zoneCard.counter += 1;
    if (zoneCard.counter < PARAMETRIC_TRANSFORMER_PROGRESS) return;
    const side = takeOne(duel.sides, sideIndex);
    for (const element of pickGcgBasicDice(PARAMETRIC_TRANSFORMER_DICE, duel.random)) createGcgDice(side, element, 1);
  },
};
