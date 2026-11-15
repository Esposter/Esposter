// A target the witness page draws beside its colour, by the name the page reads it back under
export const WitnessTargetName = {
  Albedo: "albedo",
  Depth: "depth",
  Emission: "emission",
  GeometryNormal: "geometryNormal",
  Normal: "normal",
  Occlusion: "occlusion",
  Part: "part",
  Position: "position",
  Shadow: "shadow",
} as const;
export type WitnessTargetName = (typeof WitnessTargetName)[keyof typeof WitnessTargetName];
