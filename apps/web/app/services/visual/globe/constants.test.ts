import type { LandMask } from "#src/models/visual/LandMask";

import { describe } from "vitest";

// One cell per degree, with land only in the square from 0 to 1 degree north and east
export const TEST_LAND_MASK: LandMask = {
  cellsPerDegree: 1,
  rows: Array.from({ length: 180 }, (_value, i) => (i === 89 ? [180, 181] : [])),
};

describe.todo("constants");
