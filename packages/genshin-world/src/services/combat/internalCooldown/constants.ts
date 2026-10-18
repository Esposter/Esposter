import type { InternalCooldownGroup } from "#src/models/combat/InternalCooldownGroup";

import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";

// The standard internal cooldown most abilities apply their element under: restarted by a hit 2.5 seconds after it last
// Started, and between restarts every third hit applying, for the 24 hits its sequence holds
export const DEFAULT_INTERNAL_COOLDOWN_GROUP: InternalCooldownGroup = Object.freeze({
  resetIntervalSeconds: 2.5,
  sequence: Object.freeze(Array.from({ length: 24 }, (_value, index) => (index % 3 === 0 ? 1 : 0))),
});
// Measured: gcsim (MIT) pkg/core/attacks/icd_groups.dm.go, Salon Solitaire's group, which Surintendante Chevalmarin's and
// Gentilhomme Usher's tags each count under: restarted by a hit 30 seconds after it last started, and between restarts
// Every second hit applying, for the 24 hits its sequence holds
// https://github.com/genshinsim/gcsim/blob/main/pkg/core/attacks/icd_groups.dm.go
export const FURINA_SALON_INTERNAL_COOLDOWN_GROUP: InternalCooldownGroup = Object.freeze({
  resetIntervalSeconds: 30,
  sequence: Object.freeze(Array.from({ length: 24 }, (_value, index) => (index % 2 === 0 ? 1 : 0))),
});
// Hidden Aces' robots' strikes, as gcsim gives them: the first four hits in 15 seconds count, and each hit after them none
export const JAHODA_ROBOT_INTERNAL_COOLDOWN_GROUP: InternalCooldownGroup = Object.freeze({
  resetIntervalSeconds: 15,
  sequence: Object.freeze([1, 1, 1, 1, 0]),
});
// Burning's Pyro: the first hit applies and none after it, until two seconds have passed
export const BURNING_INTERNAL_COOLDOWN_GROUP: InternalCooldownGroup = Object.freeze({
  resetIntervalSeconds: 2,
  sequence: Object.freeze([1, 0]),
});
// Citlali's Frostfall Storm, as gcsim (MIT) pkg/core/attacks/icd_groups.dm.go has it: restarted by a hit 1.5 seconds after
// It last started (line 95), and its Cryo applying on the first of every two hits (line 162). Its damage lands on every hit,
// As its damage sequence holds one (line 229)
// https://github.com/genshinsim/gcsim/blob/main/pkg/core/attacks/icd_groups.dm.go
export const CITLALI_FROSTFALL_STORM_INTERNAL_COOLDOWN_GROUP: InternalCooldownGroup = Object.freeze({
  resetIntervalSeconds: 1.5,
  sequence: Object.freeze([1, 0]),
});
// Kinich's Loop Shot, as gcsim (MIT) pkg/core/attacks/icd_groups.dm.go has it: restarted by a hit 2 seconds after it last
// Started (line 112), and its gauge applying on the first of every four hits (line 179). Its damage lands on every hit,
// As its damage sequence holds ones (line 246)
// https://github.com/genshinsim/gcsim/blob/main/pkg/core/attacks/icd_groups.dm.go
export const KINICH_LOOP_SHOT_INTERNAL_COOLDOWN_GROUP: InternalCooldownGroup = Object.freeze({
  resetIntervalSeconds: 2,
  sequence: Object.freeze([1, 0, 0, 0]),
});
// Kinich's Scalespiker Cannon, as gcsim (MIT) pkg/core/attacks/icd_groups.dm.go has it: restarted by a hit 1.2 seconds after
// It last started (line 113), and its gauge applying on the first of every four hits (line 180). Its damage lands on every
// Hit, as its damage sequence holds ones (line 247)
// https://github.com/genshinsim/gcsim/blob/main/pkg/core/attacks/icd_groups.dm.go
export const KINICH_SCALESPIKER_CANNON_INTERNAL_COOLDOWN_GROUP: InternalCooldownGroup = Object.freeze({
  resetIntervalSeconds: 1.2,
  sequence: Object.freeze([1, 0, 0, 0]),
});
// A reaction's damage on a target from one source, as the game's damage sequence limits it: Swirl, Superconduct,
// Shattered, Bloom, Hyperbloom and Burgeon deal two instances each half second, and Overloaded and Electro-Charged one
export const TWO_REACTIONS_INTERNAL_COOLDOWN_GROUP: InternalCooldownGroup = Object.freeze({
  resetIntervalSeconds: 0.5,
  sequence: Object.freeze([1, 1, 0]),
});
export const ONE_REACTION_INTERNAL_COOLDOWN_GROUP: InternalCooldownGroup = Object.freeze({
  resetIntervalSeconds: 0.5,
  sequence: Object.freeze([1, 0]),
});
// Swirls of one element, Superconducts and Overloads on a target deal damage once a tenth of a second, whatever their
// Source
export const SIMULTANEOUS_REACTION_INTERNAL_COOLDOWN_GROUP: InternalCooldownGroup = Object.freeze({
  resetIntervalSeconds: 0.1,
  sequence: Object.freeze([1, 0]),
});
export const SIMULTANEOUS_REACTION_TYPES: readonly TransformativeReactionType[] = Object.freeze([
  TransformativeReactionType.Overloaded,
  TransformativeReactionType.Superconduct,
  TransformativeReactionType.Swirl,
]);
