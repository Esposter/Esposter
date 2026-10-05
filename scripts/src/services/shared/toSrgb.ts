// A linear channel from 0 to 1 encoded to sRGB, by the piecewise curve the standard defines, `toLinear` undone
export const toSrgb = (value: number): number =>
  value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055;
