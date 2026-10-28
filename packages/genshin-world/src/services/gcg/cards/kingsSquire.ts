import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCostSubject } from "#src/models/gcg/GcgCostSubject";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { KINGS_SQUIRE_IN_EFFECT_ID } from "#src/services/gcg/cards/constants";
import { createGcgWeaponCard } from "#src/services/gcg/effects/createGcgWeaponCard";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

const KINGS_SQUIRE_REDUCTION = 2;

// Whether a cost is one King's Squire reduces: a Talent card's, or an Elemental Skill's
const checkIsKingsSquireCost = (subject: GcgCostSubject): boolean =>
  subject.card?.kind === GcgCardKind.Talent || subject.skill?.kind === GcgSkillKind.ElementalSkill;

// King's Squire, a Bow: its character deals +1 DMG, and when it is played, the next Talent card or Elemental Skill of the Round
// Spends 2 fewer Elemental Dice
export const kingsSquire: GcgCardModule = {
  ...createGcgWeaponCard("BOW"),
  play: ({ duel, sideIndex }) => {
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).onstages, KINGS_SQUIRE_IN_EFFECT_ID, kingsSquireInEffect);
  },
};

// King's Squire (In Effect): the next Talent card or Elemental Skill of the Round spends 2 fewer Elemental Dice, for one usage
export const kingsSquireInEffect: GcgCardModule = {
  initialRounds: 1,
  initialUsages: 1,
  onCostPaid: (_context, subject, zoneCard) => {
    if (checkIsKingsSquireCost(subject)) zoneCard.usages -= 1;
  },
  reduceCost: (_context, subject, zoneCard) =>
    zoneCard.usages > 0 && checkIsKingsSquireCost(subject)
      ? { count: KINGS_SQUIRE_REDUCTION, element: undefined }
      : undefined,
};
