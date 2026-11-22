import type { Locomotion } from "genshin-engine";

// The movement no body type's clips or data hold, which every type shares, in metres, metres a second and radians. Each
// Is a best estimate, provisional until a recording's motion pass reads it, as `openspec/specs/genshin/character-controller/design.md`
// Gives: the glide's forward speed and its sink, the height the glider opens at, the plunge's speed, the capsule's radius, the
// Step and the steepest slope still walkable. The glide's speed is set under the sprint's, as a published clip times a glide along
// One Mondstadt street at 15.0 seconds against a tall male's sprint at 11.9, with no distance to measure either by. The capsule's
// Height is what a resident's stand-in stands as, every body type taking its own
export const PROVISIONAL_LOCOMOTION: Pick<
  Locomotion,
  | "capsuleHeight"
  | "capsuleRadius"
  | "glideForwardSpeed"
  | "glideMinHeight"
  | "glideSinkSpeed"
  | "maxWalkableSlope"
  | "plungeSpeed"
  | "stepHeight"
> = {
  capsuleHeight: 1.6,
  capsuleRadius: 0.3,
  glideForwardSpeed: 6,
  glideMinHeight: 3,
  glideSinkSpeed: 2.5,
  maxWalkableSlope: 0.87,
  plungeSpeed: 30,
  stepHeight: 0.4,
};
