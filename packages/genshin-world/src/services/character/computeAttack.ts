import { Attribute } from "#src/models/character/Attribute";

// A character's attack from its attribute total, as the game builds it: its base raised by its percentage, plus its flat.
// A hit prices its attack from this sum, so an ATK percentage buff reaches the hit only through it
export const computeAttack = (attributeTotalMap: Record<Attribute, number>): number =>
  attributeTotalMap[Attribute.BaseAttack] * (1 + attributeTotalMap[Attribute.AttackPercent]) +
  attributeTotalMap[Attribute.Attack];
