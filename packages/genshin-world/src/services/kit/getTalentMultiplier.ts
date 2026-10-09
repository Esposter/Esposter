import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A combat talent's parameter at a level, read from the multipliers loaded for the characters in the party, by its index
// In the proud skill row's paramList, which the table keeps up to the last parameter not zero, so an index past it is zero
export const getTalentMultiplier = (
  talentMultiplierMap: TalentMultiplierMap,
  proudSkillGroupId: number,
  level: number,
  index: number,
): number => {
  const talentMultiplier = talentMultiplierMap[proudSkillGroupId]?.find((multiplier) => multiplier.level === level);
  if (talentMultiplier === undefined)
    throw new InvalidOperationError(Operation.Read, `${proudSkillGroupId}`, `no multiplier at level ${level}`);
  return talentMultiplier.paramList[index] ?? 0;
};
