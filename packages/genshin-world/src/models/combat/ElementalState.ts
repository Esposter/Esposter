import type { Aura } from "#src/models/combat/Aura";
import type { AuraType } from "#src/models/combat/AuraType";
import type { InternalCooldown } from "#src/models/combat/InternalCooldown";

// One target's elements, written in place: its auras, its own clock in seconds, when its Burning and its Electro-Charged
// Last ticked and it last crystallized, and the cooldown its Burning applies Pyro under
export interface ElementalState {
  auras: Map<AuraType, Aura>;
  // Each aura's sources, by the id of the character whose application stands in it, each held as how far the aura's
  // Gauge stands above that source's own share, so every reduction of the aura reduces each share alike, as gcsim keeps
  // An aura's durability per source. A source whose share is spent stands at or above the aura's gauge
  auraSourceDeficitMap: Map<AuraType, Map<number, number>>;
  burningInternalCooldown: InternalCooldown;
  burningSeconds: number;
  crystallizeSeconds: number;
  electroChargedSeconds: number;
  // Whether the target is immune to Frozen, so a Frozen reaction on it leaves no Freeze, as a boss is
  isFrozenImmune: boolean;
  // Whether the Electro and Hydro lying on it together are Lunar-Charged, which ticks no Electro-Charged, and when a
  // Lunar-Charged hit last struck it
  isLunarCharged: boolean;
  lunarChargedSeconds: number;
  seconds: number;
}
