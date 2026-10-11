import { KIT_PARAMETER_CODE_UNIT, KIT_PARAMETER_INDEX_SPAN } from "#src/services/genshinAssets/kits/constants";

// The number standing in for a table's parameter in an encoded build: its group and index as one integer, scaled down
// To a value no table holds
export const encodeKitParameter = ({
  index,
  proudSkillGroupId,
}: {
  index: number;
  proudSkillGroupId: number;
}): number => (proudSkillGroupId * KIT_PARAMETER_INDEX_SPAN + index + 1) * KIT_PARAMETER_CODE_UNIT;
