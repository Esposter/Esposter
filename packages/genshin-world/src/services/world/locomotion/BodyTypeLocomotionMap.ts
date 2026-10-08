import type { Locomotion } from "genshin-engine";

import { BodyType } from "#src/models/character/BodyType";
import { PROVISIONAL_LOCOMOTION } from "#src/services/world/locomotion/constants";

// How each body type moves, since how far its characters sprint and jump differs by body: a type takes its own entry
// Once its clips and recordings are measured, never another type's, and moves by the provisional movement until then.
// The medium female body's speeds, dash, climb, climb jump, swim and drowning are its own clips' root motion, read by
// `genshin:assets locomotion Girl`; what its clips do not move, the glide among them, is still provisional
export const BodyTypeLocomotionMap = {
  [BodyType.MediumFemale]: {
    ...PROVISIONAL_LOCOMOTION,
    climbJumpHeight: 3.36,
    climbJumpSeconds: 1.08,
    climbSpeed: 0.84,
    dashSeconds: 1.22,
    dashSpeed: 8.48,
    drownSeconds: 3,
    runSpeed: 5.66,
    sprintSpeed: 7.22,
    swimDashSpeed: 3.88,
    swimSpeed: 1.94,
    walkSpeed: 1.24,
  },
  [BodyType.MediumMale]: PROVISIONAL_LOCOMOTION,
  [BodyType.ShortFemale]: PROVISIONAL_LOCOMOTION,
  [BodyType.TallFemale]: PROVISIONAL_LOCOMOTION,
  [BodyType.TallMale]: PROVISIONAL_LOCOMOTION,
} as const satisfies Record<BodyType, Locomotion>;
