import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { vermillionHereafterBonus } from "#src/services/gcg/cards/vermillionHereafterBonus";
import { checkIsGcgActiveHolder } from "#src/services/gcg/effects/checkIsGcgActiveHolder";
import { createGcgOncePerRoundCostReduction } from "#src/services/gcg/effects/createGcgOncePerRoundCostReduction";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";
import { VERMILLION_HEREAFTER_ID, VERMILLION_HEREAFTER_STATUS_ID } from "#src/services/gcg/cards/constants";

// Vermillion Hereafter, an artifact: a Normal Attack or a Talent card spends one die less, once per Round, and a character
// switched to the active character deals 1 more Normal Attack DMG for the Round (the wiki's Vermillion Hereafter (Equipment Card))
export const vermillionHereafter: GcgCardModule = {
  ...createGcgOncePerRoundCostReduction(VERMILLION_HEREAFTER_ID, (context, subject) =>
    checkIsGcgActiveHolder(context) &&
    (subject.skill?.kind === GcgSkillKind.NormalAttack || subject.card?.kind === GcgCardKind.Talent)
      ? { count: 1 }
      : undefined,
  ),
  onSwitch: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    placeGcgZoneCard(
      takeOne(side.characters, side.activeIndex).statuses,
      VERMILLION_HEREAFTER_STATUS_ID,
      vermillionHereafterBonus,
    );
  },
};
