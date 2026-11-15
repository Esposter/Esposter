export const TransformSetter = {
  Angle: "angle",
  Rotation: "rotation",
  Scale: "scale",
  ScaleX: "scaleX",
  ScaleY: "scaleY",
  W: "w",
  X: "x",
  Y: "y",
  Z: "z",
} as const;
export type TransformSetter = (typeof TransformSetter)[keyof typeof TransformSetter];
