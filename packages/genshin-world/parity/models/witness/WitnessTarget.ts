// What the witness render writes per pixel beside its colour: the unlit albedo, the linear depth along the view, the
// Light the material adds after lighting (its glow and its rim), the world normal, the part drawn there with its
// Family, and the share of the sun reaching it
export enum WitnessTarget {
  Albedo = "albedo",
  Depth = "depth",
  Emission = "emission",
  Normal = "normal",
  Part = "part",
  Shadow = "shadow",
}

export const WitnessTargets: readonly WitnessTarget[] = Object.values(WitnessTarget);
