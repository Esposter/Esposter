import type { AttackArea } from "#src/models/kit/AttackArea";

// A fan of the given degrees round the body, of the given radius, as gcsim's fan hits are shaped
export const createFanReach = (degrees: number, radius: number): AttackArea =>
  Object.freeze({ angle: (degrees * Math.PI) / 180, height: 2, radius });
