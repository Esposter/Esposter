import type { Element } from "#src/models/Element";

// A status an enemy carries for the seconds left of it, which a kit's hit or an effect applies: its id, the seconds it
// Has left, the bonus its DMG taken gains, added to the damage bonus of each hit that strikes it while it lasts, and
// The RES each element's hits and physical hits lose to it, subtracted from the enemy's RES where a hit reads it. A
// Status that stacks counts its stacks, up to its maximum, and each application adds to them. A status may cut the ATK
// The enemy strikes with, and one that strikes on its own schedule counts the seconds to its next tick, which the kit of
// The character that applied it answers
export interface EnemyStatus {
  // The share of its ATK the enemy loses while it carries the status, if it lowers it
  attackReduction?: number;
  damageTakenBonus: number;
  id: string;
  maxStacks?: number;
  nextTickSeconds?: number;
  physicalResistanceReduction?: number;
  resistanceReduction?: Partial<Record<Element, number>>;
  secondsRemaining: number;
  stacks?: number;
  tickIntervalSeconds?: number;
}
