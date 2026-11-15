// How a canvas scaler sizes its canvas: at its pixels' own size, scaled with the screen, or held to a physical size
export const UiScaleMode = {
  ConstantPhysicalSize: "ConstantPhysicalSize",
  ConstantPixelSize: "ConstantPixelSize",
  ScaleWithScreenSize: "ScaleWithScreenSize",
} as const;
export type UiScaleMode = (typeof UiScaleMode)[keyof typeof UiScaleMode];
