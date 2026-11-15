export const OriginSetter = {
  DisplayOriginX: "displayOriginX",
  DisplayOriginY: "displayOriginY",
  Origin: "origin",
  OriginX: "originX",
  OriginY: "originY",
} as const;
export type OriginSetter = (typeof OriginSetter)[keyof typeof OriginSetter];
