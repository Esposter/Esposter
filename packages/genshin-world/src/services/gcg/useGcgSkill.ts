import type { GcgDuel } from "#src/models/gcg/GcgDuel";

import { GcgActionResult } from "#src/models/gcg/GcgActionResult";
import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";
import { checkGcgActingSide } from "#src/services/gcg/checkGcgActingSide";
import { checkIsGcgSkillRunnable } from "#src/services/gcg/checkIsGcgSkillRunnable";
import { passGcgTurn } from "#src/services/gcg/passGcgTurn";
import { payGcgSubjectCost } from "#src/services/gcg/payGcgSubjectCost";
import { runGcgSkillUse } from "#src/services/gcg/runGcgSkillUse";
import { takeOne } from "@esposter/shared";

// The active character uses one of its skills, paying its dice and energy: the skill's effect runs for it, its user gains
// The energy the skill gives, and the turn passes. Refused, and the duel left as it was, when the character is Frozen, the
// Skill is not its own or is a passive, its effect is one no module covers, or the costs are not covered
export const useGcgSkill = (
  duel: GcgDuel,
  sideIndex: number,
  skillId: number,
  paidDiceIndices: number[],
): GcgActionResult => {
  const refusal = checkGcgActingSide(duel, sideIndex);
  if (refusal !== undefined) return refusal;
  const side = takeOne(duel.sides, sideIndex);
  const user = side.characters.at(side.activeIndex);
  if (!user) return GcgActionResult.Unavailable;
  else if (user.isFrozen) return GcgActionResult.Frozen;
  const skill = user.character.skills.find(({ id }) => id === skillId);
  if (!skill || skill.kind === GcgSkillKind.Passive || !checkIsGcgSkillRunnable(skill.effect))
    return GcgActionResult.Unavailable;
  if (
    !payGcgSubjectCost({ duel, sideIndex }, side.activeIndex, { card: undefined, skill }, skill.costs, paidDiceIndices)
  )
    return GcgActionResult.Unpayable;
  runGcgSkillUse({ duel, sideIndex }, skill);
  user.energy = Math.min(user.character.maxEnergy, user.energy + skill.energyGain);
  passGcgTurn(duel, sideIndex);
  return GcgActionResult.Done;
};
