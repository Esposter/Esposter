// One model type's movement, in metres, seconds and radians: its capsule, its speeds on the ground, on a wall, in the air
// And in water, how high it jumps and how fast it falls, what it walks up and over, how deep it wades, how high it must
// Be to open its glider or plunge, and how long its dash, its climb's jump and its drowning last
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
