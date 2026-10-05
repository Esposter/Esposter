// An sRGB channel from 0 to 1 decoded to linear light, by the piecewise curve the standard defines
export const toLinear = (value: number): number =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
