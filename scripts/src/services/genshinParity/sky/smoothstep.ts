import { clamp } from "#src/services/genshinParity/shared/clamp";

export const smoothstep = (value: number): number => {
  const clamped = clamp(value, 0, 1);
  return clamped * clamped * (3 - 2 * clamped);
};
