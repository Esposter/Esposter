export const AlphaSetter = {
  Alpha: "alpha",
  AlphaBottomLeft: "alphaBottomLeft",
  AlphaBottomRight: "alphaBottomRight",
  AlphaTopLeft: "alphaTopLeft",
  AlphaTopRight: "alphaTopRight",
} as const;
export type AlphaSetter = (typeof AlphaSetter)[keyof typeof AlphaSetter];
