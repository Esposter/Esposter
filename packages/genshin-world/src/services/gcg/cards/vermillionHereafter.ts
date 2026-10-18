import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const VERMILLION_HEREAFTER_ID = 312_012;
// The status a character switched to holds for the Round, under the artifact's own second skill id, since the dump names no
// card for it (as Senho's passive is held under its skill id)
const VERMILLION_HEREAFTER_STATUS_ID = 3_120_111;
const VERMILLION_HEREAFTER_BONUS = 1;

// The Normal Attack DMG a character switched to the active character deals for the Round
export const vermillionHereafterBonus: GcgCardModule = {
  initialRounds: 1,
  modifyDamageDealt: (context, damage) =>
    context.skill?.kind === GcgSkillKind.NormalAttack
      ? { ...damage, value: damage.value + VERMILLION_HEREAFTER_BONUS }
      : damage,
};

// Vermillion Hereafter, an artifact: a Normal Attack or a Talent card spends one die less, once per Round, and a character
// switched to the active character deals 1 more Normal Attack DMG for the Round (the wiki's Vermillion Hereafter (Equipment Card))
export const vermillionHereafter: GcgCardModule = {
  onCostPaid: ({ duel, sideIndex }) => {
    takeOne(duel.sides, sideIndex).usedCardIds.push(VERMILLION_HEREAFTER_ID);
  },
  onSwitch: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    placeGcgZoneCard(
      takeOne(side.characters, side.activeIndex).statuses,
      VERMILLION_HEREAFTER_STATUS_ID,
      vermillionHereafterBonus,
    );
  },
  reduceCost: ({ duel, sideIndex }, subject) =>
    (subject.skill?.kind === GcgSkillKind.NormalAttack || subject.card?.kind === GcgCardKind.Talent) &&
    !takeOne(duel.sides, sideIndex).usedCardIds.includes(VERMILLION_HEREAFTER_ID)
      ? { count: 1 }
      : undefined,
};
