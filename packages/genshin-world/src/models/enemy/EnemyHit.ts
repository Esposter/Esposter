import type { Element } from "#src/models/Element";

// A hit on an enemy, as combat computes it: the damage it deals, the element it is dealt as and the poise damage it drains,
// None as the element for a physical hit, or one that reacts in several elements
export interface EnemyHit {
  damage: number;
  element?: Element;
  poiseDamage: number;
}
