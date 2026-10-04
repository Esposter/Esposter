// What the witness render writes per pixel beside its colour: the unlit albedo, the linear depth along the view, the
// World normal, and the part drawn there with its family
export enum WitnessTarget {
  Albedo = "albedo",
  Depth = "depth",
  Normal = "normal",
  Part = "part",
}

export const WitnessTargets: readonly WitnessTarget[] = Object.values(WitnessTarget);
