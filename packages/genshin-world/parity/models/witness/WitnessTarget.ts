// What the witness render writes per pixel beside its colour: the unlit albedo, the linear depth along the view, the
// Light the material adds after lighting (its glow and its rim), the world normal, the share of light the scene's
// Screen-space occlusion leaves it, the part drawn there with its family, the place on the part's own geometry it shows,
// And the share of the sun reaching it
export enum WitnessTarget {
  Albedo = "albedo",
  Depth = "depth",
  Emission = "emission",
  Normal = "normal",
  Occlusion = "occlusion",
  Part = "part",
  Position = "position",
  Shadow = "shadow",
}

export const WitnessTargets: readonly WitnessTarget[] = Object.values(WitnessTarget);
