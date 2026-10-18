import { MathUtils } from "three";

// The gust at a point on the CPU, the reference that the gust band in createWindNode is the GPU form of: a band of gust
// Travels downwind at the gust speed and is as long as the gust width, swelling and falling as it passes, so waves roll across the grass
// A change to the gust lands in both, as the outline offset pair does
export const computeWindGust = (
  downwind: number,
  time: number,
  { gustSpeed, gustStrength, gustWidth }: { gustSpeed: number; gustStrength: number; gustWidth: number },
): number => {
  const gustPhase = ((downwind - time * gustSpeed) / gustWidth) * Math.PI * 2;
  return MathUtils.smoothstep(Math.sin(gustPhase) * 0.5 + 0.5, 0.2, 1) * gustStrength;
};
