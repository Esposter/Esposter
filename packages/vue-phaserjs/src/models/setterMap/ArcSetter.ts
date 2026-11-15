export const ArcSetter = {
  ClosePath: "closePath",
  EndAngle: "endAngle",
  Radius: "radius",
  StartAngle: "startAngle",
} as const;
export type ArcSetter = (typeof ArcSetter)[keyof typeof ArcSetter];
