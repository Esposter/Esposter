import type { InternalCooldownGroup } from "#src/models/combat/InternalCooldownGroup";

// The standard internal cooldown most abilities apply their element under: restarted by a hit 2.5 seconds after it last
// Started, and between restarts every third hit applying, for the 24 hits its sequence holds
export const DEFAULT_INTERNAL_COOLDOWN_GROUP: InternalCooldownGroup = Object.freeze({
  gaugeSequence: Object.freeze(Array.from({ length: 24 }, (_value, index) => (index % 3 === 0 ? 1 : 0))),
  resetIntervalSeconds: 2.5,
});
// Burning's Pyro: the first hit applies and none after it, until two seconds have passed
export const BURNING_INTERNAL_COOLDOWN_GROUP: InternalCooldownGroup = Object.freeze({
  gaugeSequence: Object.freeze([1, 0]),
  resetIntervalSeconds: 2,
});
