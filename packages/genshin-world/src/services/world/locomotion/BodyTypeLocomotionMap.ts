import type { Locomotion } from "genshin-engine";

import { BodyType } from "#src/models/character/BodyType";
import { PROVISIONAL_LOCOMOTION } from "#src/services/world/locomotion/constants";

// How each body type moves, since how far its characters sprint and jump differs by body: a type takes its own entry
// Once its clips and recordings are measured, never another type's, and moves by the provisional movement until then.
// The medium female and medium male bodies' speeds, dash, climb, climb jump, swim and drowning are their own clips' root
// Motion at the body's human scale, read by `genshin:assets locomotion Girl` and `genshin:assets locomotion Boy`; what
// Their clips do not move, the glide among them, is still provisional
export const BodyTypeLocomotionMap = {
  [BodyType.MediumFemale]: {
    ...PROVISIONAL_LOCOMOTION,
    climbJumpHeight: 3.11,
    climbJumpSeconds: 1.08,
    climbSpeed: 0.78,
    dashSeconds: 1.22,
    dashSpeed: 7.86,
    drownSeconds: 3,
    runSpeed: 5.25,
    sprintSpeed: 6.69,
    swimDashSpeed: 3.6,
    swimSpeed: 1.8,
    walkSpeed: 1.15,
  },
  [BodyType.MediumMale]: {
    ...PROVISIONAL_LOCOMOTION,
    climbJumpHeight: 3.18,
    climbJumpSeconds: 1.08,
    climbSpeed: 0.8,
    dashSeconds: 1.28,
    dashSpeed: 8.15,
    drownSeconds: 3,
    runSpeed: 5.33,
    sprintSpeed: 6.86,
    swimDashSpeed: 3.6,
    swimSpeed: 1.17,
    walkSpeed: 1.23,
  },
  [BodyType.ShortFemale]: PROVISIONAL_LOCOMOTION,
  [BodyType.TallFemale]: PROVISIONAL_LOCOMOTION,
  [BodyType.TallMale]: PROVISIONAL_LOCOMOTION,
} as const satisfies Record<BodyType, Locomotion>;
