import type { BuffRow } from "#src/models/genshinAssets/cooking/BuffRow";
import type { DishBonus } from "genshin-world";

import { BONUS_CLAUSE_SEPARATOR_REGEX, BONUS_FLAT_ATTRIBUTE_MAP } from "#src/services/genshinAssets/cooking/constants";
import { toBonusClause } from "#src/services/genshinAssets/cooking/toBonusClause";

// The bonus a bonus buff's description gives, each clause one stat, with the seconds the buff lasts. A description with a
// Clause this does not read gives no bonus
export const toBonus = (buff: BuffRow): DishBonus | undefined => {
  const flatAttribute = BONUS_FLAT_ATTRIBUTE_MAP[buff.abilityName];
  const attributes: DishBonus["attributes"] = [];
  for (const clause of buff.desc.split(BONUS_CLAUSE_SEPARATOR_REGEX)) {
    const attribute = toBonusClause(clause, flatAttribute);
    if (attribute === undefined) return undefined;
    attributes.push(attribute);
  }
  return { attributes, seconds: buff.time, source: buff.abilityName };
};
