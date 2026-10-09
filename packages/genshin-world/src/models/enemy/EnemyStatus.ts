import type { Element } from "#src/models/Element";

// A status an enemy carries for the seconds left of it, which a kit's hit or an effect applies: its id, the seconds it
// Has left, the bonus its DMG taken gains, added to the damage bonus of each hit that strikes it while it lasts, and
// The RES each element's hits lose to it, subtracted from the enemy's RES where a hit reads it. A status that stacks
// Counts its stacks, up to its maximum, and each application adds to them
export interface EnemyStatus {
  damageTakenBonus: number;
  id: string;
  maxStacks?: number;
  resistanceReduction?: Partial<Record<Element, number>>;
  secondsRemaining: number;
  stacks?: number;
}
