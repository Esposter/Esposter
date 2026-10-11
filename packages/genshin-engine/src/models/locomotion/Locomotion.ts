// One model type's movement, in metres, seconds and radians: its capsule, its speeds on the ground, on a wall, in the air
// And in water, how high it jumps, how fast it falls and the speed its fall tops out at, what it walks up and over, how
// Deep it wades, how high it must be to open its glider or plunge, and how long its dash, its climb's jump and its
// Drowning last
export interface Locomotion {
  capsuleHeight: number;
  capsuleRadius: number;
  climbJumpHeight: number;
  climbJumpSeconds: number;
  climbSpeed: number;
  dashSeconds: number;
  dashSpeed: number;
  drownSeconds: number;
  glideForwardSpeed: number;
  glideMinHeight: number;
  glideSinkSpeed: number;
  gravity: number;
  jumpHeight: number;
  maxFallSpeed: number;
  maxWalkableSlope: number;
  plungeSpeed: number;
  runSpeed: number;
  sprintSpeed: number;
  stepHeight: number;
  swimDashSpeed: number;
  swimDepth: number;
  swimSpeed: number;
  walkSpeed: number;
}
