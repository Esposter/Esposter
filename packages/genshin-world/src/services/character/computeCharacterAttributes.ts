import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { CharacterAttributes } from "#src/models/character/CharacterAttributes";
import type { ElementalResonance } from "#src/models/party/ElementalResonance";

import { Attribute, Attributes } from "#src/models/character/Attribute";
import { ElementalResonanceAttributeLinesMap } from "#src/services/party/ElementalResonanceAttributeLinesMap";

// A character's attributes from every line it carries, as the game sums them: each attribute's lines added together,
// And Max HP, ATK and DEF each its base raised by its percentage, plus its flat. A weapon's base ATK is a line of the
// Base like the character's own, so the percentage raises both. The deployed team's resonances add their lines the same
// Way, as they hold on every member while the team holds them
export const computeCharacterAttributes = (
  attributeLines: readonly AttributeLine[],
  elementalResonances: readonly ElementalResonance[] = [],
): CharacterAttributes => {
  const attributeTotalMap = Object.fromEntries(Attributes.map((attribute) => [attribute, 0]));
  const resonanceAttributeLines = elementalResonances.flatMap(
    (resonance) => ElementalResonanceAttributeLinesMap[resonance],
  );
  for (const { attribute, value } of [...attributeLines, ...resonanceAttributeLines])
    attributeTotalMap[attribute] += value;
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
