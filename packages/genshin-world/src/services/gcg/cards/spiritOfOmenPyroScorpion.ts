import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgSkill } from "#src/models/gcg/GcgSkill";
import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { addPyroScorpionToHand } from "#src/services/gcg/cards/addPyroScorpionToHand";
import { addScorpionBlessingStack } from "#src/services/gcg/cards/addScorpionBlessingStack";
import { BURNING_ASSAULT_ID } from "#src/services/gcg/cards/constants";
import { findActiveScorpocalypse } from "#src/services/gcg/cards/findActiveScorpocalypse";
import { readScorpionBlessingStacks } from "#src/services/gcg/cards/readScorpionBlessingStacks";
import { spendScorpionBlessingStacks } from "#src/services/gcg/cards/spendScorpionBlessingStacks";
import { takeOne } from "@esposter/shared";

const BURNING_ASSAULT_DAMAGE = 2;
const PYRO_SCORPION_NEGATED_DAMAGE = 1;
const PYRO_SCORPION_ENERGY_COST = 1;

// Burning Assault, the Technique of Spirit of Omen: Pyro Scorpion: 2 Matching dice for 2 Pyro DMG, plus 1 for each stack of
// Scorpion Blessing, which it spends
export const BURNING_ASSAULT_SKILL: GcgSkill = {
  costs: [{ count: 2, kind: GcgCostKind.Matching }],
  effect: "Card_Vehicle_1230311",
  energyGain: 0,
  id: BURNING_ASSAULT_ID,
  kind: GcgSkillKind.Technique,
};

// Burning Assault: its damage is read before it is dealt, and the Scorpocalypse's mark is cleared then, so only a defeat this
// Use makes is heard after it
export const burningAssault: GcgSkillModule = {
  afterDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const scorpocalypse = findActiveScorpocalypse(side);
    if (scorpocalypse?.counter) {
      scorpocalypse.counter = 0;
      addPyroScorpionToHand(duel, sideIndex);
    }
    spendScorpionBlessingStacks(side);
  },
  getDamage: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    const scorpocalypse = findActiveScorpocalypse(side);
    if (scorpocalypse) scorpocalypse.counter = 0;
    return { damageType: Element.Pyro, value: BURNING_ASSAULT_DAMAGE + readScorpionBlessingStacks(side) };
  },
};

// Spirit of Omen: Pyro Scorpion, an equipment giving its character the Technique: while she is active and holds energy, a DMG she
// Takes is 1 less for 1 Energy, and a stack of Scorpion Blessing is generated. Its one usage is spent on that
export const pyroScorpion: GcgCardModule = {
  initialUsages: 1,
  modifyDamageReceived: ({ duel, sideIndex }, value, zoneCard) => {
    const side = takeOne(duel.sides, sideIndex);
    const holder = side.characters.at(side.activeIndex);
    if (!holder || holder.energy < PYRO_SCORPION_ENERGY_COST || value <= 0) return value;
    holder.energy -= PYRO_SCORPION_ENERGY_COST;
    zoneCard.usages -= 1;
    addScorpionBlessingStack(side);
    return Math.max(0, value - PYRO_SCORPION_NEGATED_DAMAGE);
  },
  skills: [BURNING_ASSAULT_SKILL],
};
