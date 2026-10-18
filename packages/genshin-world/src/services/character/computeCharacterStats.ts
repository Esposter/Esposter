import type { CharacterAttributes } from "#src/models/character/CharacterAttributes";

import { Attribute } from "#src/models/character/Attribute";
import { computeStatTotal } from "#src/services/character/computeStatTotal";

// The three stats the game builds from a base, each its base raised by its percentage plus its flat, from an attribute
// Total map: Max HP, ATK and DEF
export const computeCharacterStats = (
  attributeTotalMap: CharacterAttributes["attributeTotalMap"],
): Pick<CharacterAttributes, "attack" | "defense" | "maxHealth"> => ({
  attack: computeStatTotal(attributeTotalMap, Attribute.BaseAttack, Attribute.AttackPercent, Attribute.Attack),
  defense: computeStatTotal(attributeTotalMap, Attribute.BaseDefense, Attribute.DefensePercent, Attribute.Defense),
  maxHealth: computeStatTotal(attributeTotalMap, Attribute.BaseHealth, Attribute.HealthPercent, Attribute.Health),
});
