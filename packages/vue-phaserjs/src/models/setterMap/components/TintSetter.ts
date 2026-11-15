export const TintSetter = {
  Tint: "tint",
  TintBottomLeft: "tintBottomLeft",
  TintBottomRight: "tintBottomRight",
  TintTopLeft: "tintTopLeft",
  TintTopRight: "tintTopRight",
} as const;
export type TintSetter = (typeof TintSetter)[keyof typeof TintSetter];
