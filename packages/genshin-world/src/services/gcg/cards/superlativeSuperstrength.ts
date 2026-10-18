import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgCharacterState } from "#src/models/gcg/GcgCharacterState";

import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { checkIsGcgActiveHolder } from "#src/services/gcg/effects/checkIsGcgActiveHolder";
import { checkIsGcgChargedAttack } from "#src/services/gcg/effects/checkIsGcgChargedAttack";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

export const SUPERLATIVE_SUPERSTRENGTH_ID = 116_054;
const SUPERLATIVE_SUPERSTRENGTH_BONUS = 1;
const SUPERLATIVE_SUPERSTRENGTH_MAX_USAGES = 3;
// The usages a Superlative Superstrength needs left for its character's Charged Attacks to cost one Unaligned die less
const SUPERLATIVE_SUPERSTRENGTH_REDUCTION_USAGES = 2;

// Superlative Superstrength, a status on the character it is attached to: each Charged Attack she uses deals 1 more DMG and
// Spends a usage, and with at least two usages a Charged Attack costs one Unaligned die less. Each attachment is one usage,
// And they stack up to three
export const superlativeSuperstrength: GcgCardModule = {
  initialUsages: 1,
  maxUsages: SUPERLATIVE_SUPERSTRENGTH_MAX_USAGES,
  modifyDamageDealt: (context, damage) =>
    checkIsGcgChargedAttack(takeOne(context.duel.sides, context.sideIndex), context.skill)
      ? { ...damage, value: damage.value + SUPERLATIVE_SUPERSTRENGTH_BONUS }
      : damage,
  onSkillUsed: ({ duel, sideIndex }, skill, zoneCard) => {
    if (checkIsGcgChargedAttack(takeOne(duel.sides, sideIndex), skill)) zoneCard.usages -= 1;
  },
  reduceCost: (context, subject, zoneCard) =>
    checkIsGcgActiveHolder(context) &&
    checkIsGcgChargedAttack(takeOne(context.duel.sides, context.sideIndex), subject.skill) &&
    zoneCard.usages >= SUPERLATIVE_SUPERSTRENGTH_REDUCTION_USAGES
      ? { count: 1, kind: GcgCostKind.Unaligned }
      : undefined,
};

// Attaches a Superlative Superstrength to a character: one more usage on the one she has, up to its most
export const attachSuperlativeSuperstrength = (character: GcgCharacterState): void => {
  placeGcgZoneCard(character.statuses, SUPERLATIVE_SUPERSTRENGTH_ID, superlativeSuperstrength);
};
