import type { Locomotion } from "genshin-engine";

import { BodyType } from "#src/models/character/BodyType";
import { PROVISIONAL_LOCOMOTION } from "#src/services/world/locomotion/constants";

// How each body type moves, since how far its characters sprint and jump differs by body: each type's own entry, never
// Another's, over the provisional movement every type shares for what nothing of the game holds yet.
// - Its speeds, dash, climb, climb jump, swim and drowning are its own clips' root motion at its human scale, read by
//   `genshin:assets locomotion <body>`.
// - Its jump is its jump clip's root curve at that scale: the apex is the jump's height, and the gravity is the one that
//   Brings the body back to its take-off height when the clip's root does, half a second on. Its fall tops out at the
//   Speed the clip's root settles at as it falls.
// - Its capsule is as tall as the character whose avatar gives its scale, by that character's height in the dump's
//   Configuration, and it swims where water reaches seven tenths of that height. Provisional: the wiki gives deep
//   Water's threshold varying with the character's height, and seven tenths keeps the old provisional depth's share
export const BodyTypeLocomotionMap = {
  [BodyType.MediumFemale]: {
    ...PROVISIONAL_LOCOMOTION,
    capsuleHeight: 1.56,
    climbJumpHeight: 3.11,
    climbJumpSeconds: 1.08,
    climbSpeed: 0.78,
    dashSeconds: 1.22,
    dashSpeed: 7.86,
    drownSeconds: 3,
    gravity: 37.5,
    jumpHeight: 1.09,
    maxFallSpeed: 21,
    runSpeed: 5.25,
    sprintSpeed: 6.69,
    swimDashSpeed: 3.6,
    swimDepth: 1.09,
    swimSpeed: 1.8,
    walkSpeed: 1.15,
  },
  [BodyType.MediumMale]: {
    ...PROVISIONAL_LOCOMOTION,
    capsuleHeight: 1.62,
    climbJumpHeight: 3.18,
    climbJumpSeconds: 1.08,
    climbSpeed: 0.8,
    dashSeconds: 1.28,
    dashSpeed: 8.15,
    drownSeconds: 3,
    gravity: 39.8,
    jumpHeight: 1.15,
    maxFallSpeed: 20.9,
    runSpeed: 5.33,
    sprintSpeed: 6.86,
    swimDashSpeed: 3.6,
    swimDepth: 1.13,
    swimSpeed: 1.17,
    walkSpeed: 1.23,
  },
  [BodyType.ShortFemale]: {
    ...PROVISIONAL_LOCOMOTION,
    capsuleHeight: 1.34,
    climbJumpHeight: 3.01,
    climbJumpSeconds: 1.08,
    climbSpeed: 0.78,
    dashSeconds: 1.28,
    dashSpeed: 7.24,
    drownSeconds: 3,
    gravity: 42.9,
    jumpHeight: 1.07,
    maxFallSpeed: 18,
    runSpeed: 4.8,
    sprintSpeed: 6.43,
    swimDashSpeed: 3.6,
    swimDepth: 0.94,
    swimSpeed: 1.8,
    walkSpeed: 0.99,
  },
  [BodyType.TallFemale]: {
    ...PROVISIONAL_LOCOMOTION,
    capsuleHeight: 1.73,
    climbJumpHeight: 3.3,
    climbJumpSeconds: 1.08,
    climbSpeed: 0.84,
    dashSeconds: 1.4,
    dashSpeed: 7.89,
    drownSeconds: 3,
    gravity: 40,
    jumpHeight: 1.28,
    maxFallSpeed: 21.3,
    runSpeed: 5.68,
    sprintSpeed: 7.17,
    swimDashSpeed: 3.9,
    swimDepth: 1.21,
    swimSpeed: 1.95,
    walkSpeed: 1.24,
  },
  [BodyType.TallMale]: {
    ...PROVISIONAL_LOCOMOTION,
    capsuleHeight: 1.86,
    climbJumpHeight: 3.72,
    climbJumpSeconds: 1.08,
    climbSpeed: 0.94,
    dashSeconds: 1.18,
    dashSpeed: 9.47,
    drownSeconds: 3,
    gravity: 48.5,
    jumpHeight: 1.22,
    maxFallSpeed: 18,
    runSpeed: 5.74,
    sprintSpeed: 7.5,
    swimDashSpeed: 3.9,
    swimDepth: 1.3,
    swimSpeed: 1.38,
    walkSpeed: 1.2,
  },
} as const satisfies Record<BodyType, Locomotion>;
