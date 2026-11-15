// How a canvas scaler matches the screen's aspect to its reference resolution.
// By a blend of width and height, or by expanding or shrinking the canvas to fit.
export const ScreenMatchMode = {
  Expand: "Expand",
  MatchWidthOrHeight: "MatchWidthOrHeight",
  Shrink: "Shrink",
} as const;
export type ScreenMatchMode = (typeof ScreenMatchMode)[keyof typeof ScreenMatchMode];
