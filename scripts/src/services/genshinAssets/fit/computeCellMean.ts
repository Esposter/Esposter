import type { Vector } from "#src/models/shared/Vector";

export const computeCellMean = (colors: readonly Vector[], cells: readonly number[]): Vector =>
  ([0, 1, 2] as const).map(
    (channel) => cells.reduce((sum, cell) => sum + (colors[cell]?.[channel] ?? 0), 0) / Math.max(cells.length, 1),
  ) as Vector;
