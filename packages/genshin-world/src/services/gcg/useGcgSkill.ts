import type { GcgDuel } from "#src/models/gcg/GcgDuel";
import type { GcgRule } from "#src/models/gcg/GcgRule";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgCostKind } from "#src/models/gcg/GcgCostKind";
import { applyGcgDamage } from "#src/services/gcg/applyGcgDamage";
import { checkGcgActingSide } from "#src/services/gcg/checkGcgActingSide";
import { passGcgTurn } from "#src/services/gcg/passGcgTurn";
import { payGcgCost } from "#src/services/gcg/payGcgCost";
import { takeOne } from "@esposter/shared";

// The active character uses one of its skills, paying its dice and energy: the skill's damage settles against the opposing
// Active character, its user gains the energy the skill gives, and the turn passes. Refused, and the duel left as it was,
// When the character is Frozen, the skill is not its own, or the costs are not covered
export const useGcgSkill = (
  duel: GcgDuel,
  sideIndex: number,
  skillId: number,
  paidDiceIndices: number[],
  rule: GcgRule,
): GcgActionResult => {
  const refusal = checkGcgActingSide(duel, sideIndex);
  if (refusal !== undefined) return refusal;
  const side = takeOne(duel.sides, sideIndex);
  const user = side.characters.at(side.activeIndex);
  if (!user) return GcgActionResult.Unavailable;
  else if (user.isFrozen) return GcgActionResult.Frozen;
  const skill = user.character.skills.find(({ id }) => id === skillId);
  if (!skill) return GcgActionResult.Unavailable;
  const energyCost = skill.costs.reduce(
    (total, cost) => (cost.kind === GcgCostKind.Energy ? total + cost.count : total),
    0,
  );
  if (user.energy < energyCost || !payGcgCost(side, user.character.element, skill.costs, paidDiceIndices))
    return GcgActionResult.Unpayable;
  user.energy = Math.min(user.character.maxEnergy, user.energy - energyCost + skill.energyGain);
  applyGcgDamage(duel, sideIndex, skill.damage, rule);
  passGcgTurn(duel, sideIndex);
  return GcgActionResult.Done;
};
