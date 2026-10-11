import type { AttackArea } from "genshin-world";

// A fan of the given degrees round the body, of the given radius, as gcsim's fan hits are shaped
export const createFanReach = (degrees: number, radius: number): AttackArea => ({
  angle: (degrees * Math.PI) / 180,
  height: 2,
  radius,
});
