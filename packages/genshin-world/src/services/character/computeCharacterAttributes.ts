import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { CharacterAttributes } from "#src/models/character/CharacterAttributes";

import { Attribute, Attributes } from "#src/models/character/Attribute";

// A character's attributes from every line it carries, as the game sums them: each attribute's lines added together,
// And Max HP, ATK and DEF each its base raised by its percentage, plus its flat. A weapon's base ATK is a line of the
// Base like the character's own, so the percentage raises both
export const computeCharacterAttributes = (attributeLines: readonly AttributeLine[]): CharacterAttributes => {
  const attributeTotalMap = Object.fromEntries(Attributes.map((attribute) => [attribute, 0]));
  for (const { attribute, value } of attributeLines) attributeTotalMap[attribute] += value;
  return {
    attack:
      attributeTotalMap[Attribute.BaseAttack] * (1 + attributeTotalMap[Attribute.AttackPercent]) +
      attributeTotalMap[Attribute.Attack],
    attributeTotalMap,
    defense:
      attributeTotalMap[Attribute.BaseDefense] * (1 + attributeTotalMap[Attribute.DefensePercent]) +
      attributeTotalMap[Attribute.Defense],
    maxHealth:
      attributeTotalMap[Attribute.BaseHealth] * (1 + attributeTotalMap[Attribute.HealthPercent]) +
      attributeTotalMap[Attribute.Health],
  };
};
