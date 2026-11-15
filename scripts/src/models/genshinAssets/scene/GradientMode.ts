// How a gradient reads between its keys, as this game's Unity has them (perceptual blending came after it)
export const GradientMode = {
  // Linearly between the keys either side
  Blend: 0,
  // The first key after the time, held
  Fixed: 1,
} as const;
export type GradientMode = (typeof GradientMode)[keyof typeof GradientMode];
