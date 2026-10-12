// The ramp's column u for a threshold z: x is how far z falls short of the light area W, measured in band widths w,
// Clamped to the ramp, and u is its mirror, so a fully lit pixel reads the ramp's right end
export const getRampColumn = (threshold: number, lightArea: number, rampWidth: number): number => {
  const x = Math.min(Math.max((lightArea - threshold) / lightArea / rampWidth, 0), 1);
  return 1 - x;
};
