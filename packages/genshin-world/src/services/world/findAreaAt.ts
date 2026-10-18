import type { CatalogueArea } from "#src/models/world/CatalogueArea";

import { computeOutlineDistance } from "genshin-engine";

// The first area whose drawn outline holds the point on the ground, none where no outline does
export const findAreaAt = (areas: readonly CatalogueArea[], x: number, z: number): CatalogueArea | undefined =>
  areas.find(({ outline }) => computeOutlineDistance(outline, x, z) === 0);
