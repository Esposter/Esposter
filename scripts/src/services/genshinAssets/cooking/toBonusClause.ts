import type { Attribute, DishBonus } from "genshin-world";

import {
  BONUS_CLAUSE_ATTRIBUTE_MAP,
  BONUS_FLAT_CLAUSE_REGEX,
  BONUS_PERCENT_CLAUSE_REGEX,
  PERCENT_TOTAL,
} from "#src/services/genshinAssets/cooking/constants";

// The stat one clause of a bonus description gives: a flat amount of the attribute its ability names, or a percentage of
// The attribute its name gives, kept as a fraction. A clause this does not read gives none
export const toBonusClause = (
  clause: string,
  flatAttribute: Attribute | undefined,
): DishBonus["attributes"][number] | undefined => {
  const flatMatch = BONUS_FLAT_CLAUSE_REGEX.exec(clause);
  if (flatMatch?.groups)
    return flatAttribute === undefined
      ? undefined
      : { amount: Number(flatMatch.groups.flat), attribute: flatAttribute };
  const percentMatch = BONUS_PERCENT_CLAUSE_REGEX.exec(clause);
  if (percentMatch?.groups === undefined) return undefined;
  const { name } = percentMatch.groups;
  const attribute = name === undefined ? undefined : BONUS_CLAUSE_ATTRIBUTE_MAP[name];
  return attribute === undefined
    ? undefined
    : { amount: Number(percentMatch.groups.percent) / PERCENT_TOTAL, attribute };
};
