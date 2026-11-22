// A number rounded to the nearest step of `scale` to a unit, so a scale of 10 rounds to tenths
export const roundToScale = (value: number, scale: number): number => Math.round(value * scale) / scale;
