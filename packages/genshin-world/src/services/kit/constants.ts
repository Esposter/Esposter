import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
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

// Provisional: the strikes' and charged attack's reach, read off a recording until the attack clips measure it
const SWORD_HIT_AREA: AttackArea = Object.freeze({ angle: (2 * Math.PI) / 3, height: 2, radius: 2 });
// Palm Vortex's reach as the wiki gives it, 6 metres at 100 degrees and 2 high
const PALM_VORTEX_HIT_AREA: AttackArea = Object.freeze({ angle: (5 * Math.PI) / 9, height: 2, radius: 6 });
// Provisional: the burst's reach, read off a recording until the attack clips measure it
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 7, radius: 3 });
// The plunge collision's reach as the wiki gives it, 1 metre all round, its height taken as the low plunge's
// Provisional: the collision's height, which the wiki does not give
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
// Provisional: the low and high plunges' reach, read off a recording until the plunge clips measure it
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1.5 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2.5 });
// The wiki's targeting reach for a sword's attacks, 5 metres and 6 high, and for Palm Vortex, 15 metres and 10 high
const SWORD_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
// Provisional: the burst's and the plunges' targeting reach, taken as the skill's and a sword's until the wiki gives them
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Provisional: the strike timings a recording of the Traveler's normal attack clips reads, through `genshin:assets timings`
const createNormalAttack = (
  talentMultiplier: number,
  poiseDamage: number,
  hitmarkSeconds: number,
  seconds: number,
): KitAction =>
  Object.freeze({
    hits: [
      {
        hitArea: SWORD_HIT_AREA,
        hitmarkSeconds,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage,
        talentMultiplier,
      },
    ],
    seconds,
    targetingArea: SWORD_TARGETING_AREA,
  });

// The Traveler's first kit, at talent level 1, as the wiki's Lumine's Foreign Ironwind gives it: five strikes, a charged
// Attack, a collision and two plunges, then Palm Vortex and Gust Surge at the element a statue gives them, at 1U
export const TRAVELER_KIT: Kit = {
  burstCooldownSeconds: 15,
  burstEnergyCost: 60,
  chargedAttack: {
    hits: [
      {
        hitArea: SWORD_HIT_AREA,
        hitmarkSeconds: 0.3,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 50.6,
        talentMultiplier: 0.559,
      },
      {
        hitArea: SWORD_HIT_AREA,
        hitmarkSeconds: 0.45,
        internalCooldownTag: InternalCooldownTag.NormalAttack,
        poiseDamage: 50.6,
        talentMultiplier: 0.722,
      },
    ],
    seconds: 0.8,
    targetingArea: SWORD_TARGETING_AREA,
  },
  chargedAttackStamina: 20,
  elementalBurst: {
    hits: [
      {
        gauge: 1,
        hitArea: BURST_HIT_AREA,
        hitmarkSeconds: 0.5,
        internalCooldownTag: InternalCooldownTag.ElementalBurst,
        // Provisional: no source yet gives Gust Surge's poise damage
        poiseDamage: 0,
        talentMultiplier: 0.808,
      },
    ],
    seconds: 1,
    targetingArea: SKILL_TARGETING_AREA,
  },
  elementalSkill: {
    hits: [
      {
        gauge: 1,
        hitArea: PALM_VORTEX_HIT_AREA,
        hitmarkSeconds: 0.2,
        internalCooldownTag: InternalCooldownTag.ElementalSkill,
        // Provisional: no source yet gives Palm Vortex's poise damage
        poiseDamage: 0,
        talentMultiplier: 1.76,
      },
    ],
    seconds: 0.6,
    targetingArea: SKILL_TARGETING_AREA,
  },
  highPlunge: {
    hits: [
      { hitArea: HIGH_PLUNGE_HIT_AREA, hitmarkSeconds: 0, isBlunt: true, poiseDamage: 150, talentMultiplier: 1.6 },
    ],
    seconds: 0.4,
    targetingArea: SWORD_TARGETING_AREA,
  },
  lowPlunge: {
    hits: [
      { hitArea: LOW_PLUNGE_HIT_AREA, hitmarkSeconds: 0, isBlunt: true, poiseDamage: 100, talentMultiplier: 1.28 },
    ],
    seconds: 0.4,
    targetingArea: SWORD_TARGETING_AREA,
  },
  normalAttacks: [
    createNormalAttack(0.445, 40.5, 0.15, 0.4),
    createNormalAttack(0.434, 39.6, 0.15, 0.4),
    createNormalAttack(0.53, 48.6, 0.15, 0.4),
    createNormalAttack(0.583, 54, 0.15, 0.4),
    createNormalAttack(0.708, 64.8, 0.25, 0.6),
  ],
  plungeCollision: { hitArea: PLUNGE_COLLISION_HIT_AREA, hitmarkSeconds: 0, poiseDamage: 25, talentMultiplier: 0.639 },
  skillCooldownSeconds: 5,
};
