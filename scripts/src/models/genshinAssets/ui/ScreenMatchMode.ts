// How a canvas scaler matches the screen's aspect to its reference resolution: by a blend of width and height, or by
// expanding or shrinking the canvas to fit
export enum ScreenMatchMode {
  Expand = "Expand",
  MatchWidthOrHeight = "MatchWidthOrHeight",
  Shrink = "Shrink",
}
