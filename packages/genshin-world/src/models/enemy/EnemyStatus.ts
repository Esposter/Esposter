import type { Element } from "#src/models/Element";

// A status an enemy carries for the seconds left of it, which a kit's hit or an effect applies: its id, the seconds it
// Has left, the bonus its DMG taken gains, added to the damage bonus of each hit that strikes it while it lasts, and
// The RES each element's hits and physical hits lose to it, subtracted from the enemy's RES where a hit reads it, and the
// DEF it loses, taken off the enemy's defence where a hit reads it. A status that stacks counts its stacks, up to its
// Maximum, and each application adds to them. A status may cut the ATK the enemy strikes with, and one that strikes on
// Its own schedule counts the seconds to its next tick, which the kit of the character that applied it answers
export interface EnemyStatus {
  // The share of its ATK the enemy loses while it carries the status, if it lowers it
  attackReduction?: number;
  damageTakenBonus: number;
  // The share of its DEF the enemy loses while it carries the status, if it lowers it. The defence a hit reads is the
  // Game's defence multiplier, (5A + 500) / ((1 - reduction) × (1 - ignored) × DEF + 5A + 500) for an attacker of level A,
  // As gcsim v2.47.2 (MIT) pkg/enemy/damage.go gives it with its DefMod summed into the enemy's level term
  // https://github.com/genshinsim/gcsim/blob/v2.47.2/pkg/enemy/damage.go
  defenseReduction?: number;
  id: string;
  maxStacks?: number;
  nextTickSeconds?: number;
  physicalResistanceReduction?: number;
  resistanceReduction?: Partial<Record<Element, number>>;
  secondsRemaining: number;
  stacks?: number;
  tickIntervalSeconds?: number;
}
