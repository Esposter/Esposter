import { KIT_PARAMETER_CODE_UNIT, KIT_PARAMETER_INDEX_SPAN } from "#src/services/genshinAssets/kits/constants";
import { encodeKitParameter } from "#src/services/genshinAssets/kits/module/encodeKitParameter";

// The table's parameter an encoded build's value stands for, if it stands for one exactly: a value the kit computed
// From a parameter, a sum or a product, stands for none
export const decodeKitParameter = (value: unknown): undefined | { index: number; proudSkillGroupId: number } => {
  if (typeof value !== "number" || value <= 0) return undefined;
  const code = Math.round(value / KIT_PARAMETER_CODE_UNIT) - 1;
  const parameter = {
    index: code % KIT_PARAMETER_INDEX_SPAN,
    proudSkillGroupId: Math.floor(code / KIT_PARAMETER_INDEX_SPAN),
  };
  return encodeKitParameter(parameter) === value ? parameter : undefined;
};
