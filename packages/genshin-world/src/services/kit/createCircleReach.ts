import type { AttackArea } from "#src/models/kit/AttackArea";

// A circle centred ahead of the body is priced as its offset plus its radius, since an area holds no offset of its own
export const createCircleReach = (offset: number, radius: number): AttackArea =>
  Object.freeze({ angle: 2 * Math.PI, height: 2, radius: offset + radius });
