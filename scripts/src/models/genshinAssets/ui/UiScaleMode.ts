// How a canvas scaler sizes its canvas: at its pixels' own size, scaled with the screen, or held to a physical size
export enum UiScaleMode {
  ConstantPhysicalSize = "ConstantPhysicalSize",
  ConstantPixelSize = "ConstantPixelSize",
  ScaleWithScreenSize = "ScaleWithScreenSize",
}
