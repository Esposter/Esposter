import talentMultiplierMapJson from "#src/generated/stats/talentMultipliers.json";
import { talentMultiplierMapSchema } from "#src/models/character/TalentMultiplierMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The table the stats run writes, checked against its shape once as this module loads
const talentMultiplierMap = talentMultiplierMapSchema.parse(talentMultiplierMapJson);

// A combat talent's parameter at a level, by its index in the proud skill row's paramList, which the table keeps up to
// The last parameter not zero, so an index past it is zero
export const getTalentMultiplier = (proudSkillGroupId: number, level: number, index: number): number => {
  const talentMultiplier = talentMultiplierMap[proudSkillGroupId]?.find((multiplier) => multiplier.level === level);
  if (talentMultiplier === undefined)
    throw new InvalidOperationError(Operation.Read, `${proudSkillGroupId}`, `no multiplier at level ${level}`);
  return talentMultiplier.paramList[index] ?? 0;
};
