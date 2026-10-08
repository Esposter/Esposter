import type { Locomotion } from "genshin-engine";

// The movement every body type moves by until its own is measured, in metres, seconds and radians. Provisional, each
// Read as `apps/web/content/docs/genshin/character-controller.md` lists: the speeds, the dash and the climb's and the
// Swim's motion off the body type's locomotion clips by `genshin:assets locomotion`, and the jump, the fall, the glide,
// The plunge, the capsule, the step, the slope, the wading depth, the glider's height and drowning off recordings
export const PROVISIONAL_LOCOMOTION: Locomotion = {
  capsuleHeight: 1.6,
  capsuleRadius: 0.3,
  climbJumpHeight: 2.5,
  climbJumpSeconds: 0.6,
  climbSpeed: 1.6,
  dashSeconds: 0.3,
  dashSpeed: 12,
  drownSeconds: 3,
  glideForwardSpeed: 8,
  glideMinHeight: 3,
  glideSinkSpeed: 2.5,
  gravity: 22,
  jumpHeight: 1.4,
  maxWalkableSlope: 0.87,
  plungeSpeed: 30,
  runSpeed: 5,
  sprintSpeed: 7.5,
  stepHeight: 0.4,
  swimDashSpeed: 4.5,
  swimDepth: 1.1,
  swimSpeed: 2.5,
  walkSpeed: 2,
};
