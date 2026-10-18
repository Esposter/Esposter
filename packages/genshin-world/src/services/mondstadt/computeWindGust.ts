import { MathUtils } from "three";

// The gust at a point on the CPU, as the engine's wind node computes it on the GPU: a band of gust travels
// Downwind at the gust speed and is as long as the gust width, swelling and falling as it passes, so waves roll across the grass
export const computeWindGust = (
  downwind: number,
  time: number,
  { gustSpeed, gustStrength, gustWidth }: { gustSpeed: number; gustStrength: number; gustWidth: number },
): number => {
  const gustPhase = ((downwind - time * gustSpeed) / gustWidth) * Math.PI * 2;
  return MathUtils.smoothstep(Math.sin(gustPhase) * 0.5 + 0.5, 0.2, 1) * gustStrength;
};
