import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { SHIMENAWAS_REMINISCENCE_ID } from "#src/services/gcg/cards/constants";
import { createGcgOncePerRoundCostReduction } from "#src/services/gcg/effects/createGcgOncePerRoundCostReduction";
import { takeOne } from "@esposter/shared";

const SHIMENAWAS_REMINISCENCE_ENERGY = 2;
const SHIMENAWAS_REMINISCENCE_DAMAGE_BONUS = 1;

// Shimenawa's Reminiscence, an artifact: once per round, a Talent card played or an Elemental Skill used spends one Elemental Die
// Less. While its character has at least 2 Energy, her Normal Attacks and Elemental Skills deal 1 more DMG (the wiki's)
export const shimenawasReminiscence: GcgCardModule = {
  ...createGcgOncePerRoundCostReduction(SHIMENAWAS_REMINISCENCE_ID, (_context, subject) =>
    (subject.card?.kind === GcgCardKind.Talent || subject.skill?.kind === GcgSkillKind.ElementalSkill) &&
    subject.costs.some(({ kind }) => kind === GcgCostKind.Dice)
      ? { count: 1, kind: GcgCostKind.Dice }
      : undefined,
  ),
  modifyDamageDealt: ({ duel, sideIndex, skill }, damage) => {
    const side = takeOne(duel.sides, sideIndex);
    const isAtEnergy = takeOne(side.characters, side.activeIndex).energy >= SHIMENAWAS_REMINISCENCE_ENERGY;
    const isNormalOrElementalSkill =
      skill?.kind === GcgSkillKind.NormalAttack || skill?.kind === GcgSkillKind.ElementalSkill;
    return isAtEnergy && isNormalOrElementalSkill
      ? { ...damage, value: damage.value + SHIMENAWAS_REMINISCENCE_DAMAGE_BONUS }
      : damage;
  },
};
