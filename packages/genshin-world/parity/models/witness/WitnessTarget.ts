// What the witness render writes per pixel beside its colour: the unlit albedo, the linear depth along the view, the
// Light the material adds after lighting (its glow and its rim), the world normal and the one its geometry carries
// Before its normal map bends it, the share of light the scene's screen-space occlusion leaves it, the part drawn there
// With its family, the place on the part's own geometry it shows, and the share of the sun reaching it
export enum WitnessTarget {
  Albedo = "albedo",
  Depth = "depth",
  Emission = "emission",
  GeometryNormal = "geometryNormal",
  Normal = "normal",
  Occlusion = "occlusion",
  Part = "part",
  Position = "position",
  Shadow = "shadow",
}

export const WitnessTargets: readonly WitnessTarget[] = Object.values(WitnessTarget);
