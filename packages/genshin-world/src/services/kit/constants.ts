import { LocomotionState } from "genshin-engine";

// The states a kit's normal attacks, charged attack and plunge landings start and continue on, on the ground
export const ON_FOOT_LOCOMOTION_STATES: readonly LocomotionState[] = [
  LocomotionState.Idle,
  LocomotionState.Run,
  LocomotionState.Sprint,
  LocomotionState.Walk,
];
// The states a skill or burst starts and continues in as well as on the ground: falling and jumping
export const AIRBORNE_LOCOMOTION_STATES: readonly LocomotionState[] = [LocomotionState.Fall, LocomotionState.Jump];
// Holding the attack past this many seconds makes the string's next strike a charged attack, once the strike ends
// Provisional: the hold a recording of the attack clips' input reads, through `genshin:assets timings`
export const CHARGED_ATTACK_HOLD_SECONDS = 0.3;
// The string starts again once this many seconds have passed since a strike ended unpressed
// Provisional: the pause between strikes a recording of the attack clips reads, through `genshin:assets timings`
export const NORMAL_ATTACK_RESET_SECONDS = 0.5;
// A plunge strikes once every this many seconds while it falls
// Provisional: the collision interval a recording of the plunge clip reads, through `genshin:assets timings`
export const PLUNGE_COLLISION_SECONDS = 0.3;
// A plunge landing from a drop higher than this is a high plunge, and from or under it a low one, as the wiki gives
export const HIGH_PLUNGE_MIN_HEIGHT = 2.4;
// An enemy more than this many metres above or below the body scores lower as a target, by the wiki's targeting score
export const ALTITUDE_LIMIT = 2;
export const ALTITUDE_COEFFICIENT = 0.2;

// The wiki's targeting score weighs an enemy's nearness to the body at 0.7 and its being ahead of it at 0.3
export const TARGET_DISTANCE_WEIGHT = 0.7;
export const TARGET_ANGLE_WEIGHT = 0.3;
// Provisional: an enemy's strike is its ATK at this multiple, which no table gives
// Until a recording of an enemy's attack measures it
export const ENEMY_STRIKE_TALENT_MULTIPLIER = 1;
// The seed of the stream the kit's own rolls read, such as Breastplate's heal. No combat stream is seeded yet, so the
// Strikes' CRIT Rate roll still reads Math.random
export const KIT_RANDOM_SEED = 1;
