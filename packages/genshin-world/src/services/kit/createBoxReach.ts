import type { AttackArea } from "#src/models/kit/AttackArea";

// Measured: gcsim v2.47.2 (MIT) zhongli/attack.go. A circle centred ahead of the body is priced as its offset plus its
// Radius at gcsim's fan angle, and a box spawned on its near edge ahead of the body as the circle to its far corner
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/zhongli/attack.go
export const createBoxReach = (offset: number, width: number, length: number): AttackArea =>
  Object.freeze({ angle: 2 * Math.PI, height: 2, radius: Math.hypot(offset + length, width / 2) });
