import type { Vector } from "#src/models/shared/Vector";

import { describe } from "vitest";

// A sun and a sky of their own colours, mixed in each pixel's own shares over albedos of their own, which the display
// Tests light a scene with
export const SUN: Vector = [1, 0.8, 0.5];
export const SKY: Vector = [0.3, 0.5, 1];
export const ALBEDOS: Vector[] = [
  [0.5, 0.4, 0.3],
  [0.2, 0.6, 0.4],
  [0.7, 0.3, 0.6],
];
export const SHARES: [number, number][] = [
  [0, 1],
  [1, 0.2],
  [3, 0.5],
];

// Fixtures only: a suite here would run again in every file that imports them
describe.todo("constants");
