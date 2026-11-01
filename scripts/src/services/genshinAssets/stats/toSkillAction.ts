import type { SkillAction } from "#src/models/genshinAssets/stats/SkillAction";

// A talent config's action read in either of its two shapes, or none where it is not a skill action
export const toSkillAction = (action: Record<string, unknown>): SkillAction | undefined => {
  if (
    action.MONCLPCEMJG === "AvatarSkill" &&
    typeof action.CCDDFPKKMDK === "number" &&
    typeof action.PLLGLGGOCHL === "number"
  )
    return { levels: action.PLLGLGGOCHL, slot: action.CCDDFPKKMDK };
  if (
    action.talentType === "AvatarSkill" &&
    typeof action.talentIndex === "number" &&
    typeof action.extraLevel === "number"
  )
    return { levels: action.extraLevel, slot: action.talentIndex };
  return undefined;
};
