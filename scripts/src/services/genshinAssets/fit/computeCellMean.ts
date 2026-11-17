import type { Vector } from "#src/models/shared/Vector";

import { mapVector } from "#src/services/shared/mapVector";

export const computeCellMean = (colors: readonly Vector[], cells: readonly number[]): Vector =>
  mapVector(
    (channel) => cells.reduce((sum, cell) => sum + (colors[cell]?.[channel] ?? 0), 0) / Math.max(cells.length, 1),
  );
