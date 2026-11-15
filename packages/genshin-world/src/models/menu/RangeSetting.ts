// The settings a range slider holds, by their names in GenshinSettings: the camera's default distance and its horizontal
// And vertical sensitivity
export const RangeSetting = {
  DefaultDistance: "defaultDistance",
  HorizontalSensitivity: "horizontalSensitivity",
  VerticalSensitivity: "verticalSensitivity",
} as const;
export type RangeSetting = (typeof RangeSetting)[keyof typeof RangeSetting];
