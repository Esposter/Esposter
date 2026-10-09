import type { FittedSurface } from "#src/models/genshinAssets/fit/FittedSurface";
import type { SurfaceSample } from "#src/models/genshinAssets/fit/SurfaceSample";

import { computeSurfaceTones } from "#src/services/genshinAssets/fit/computeSurfaceTones";

// Each material's surface fitted apart: the samples grouped by the part they read, each group's colour and palette as
// `computeSurfaceTones` fits them. A sample of no part (a terrain tile's base map) and one of no weight count for nothing,
// So a part with no weight to fit is absent rather than fitted to nothing
export const computePartSurfaces = (samples: readonly SurfaceSample[]): Record<string, FittedSurface> => {
  const partGroups = Object.groupBy(
    samples.filter(({ part, weight }) => part !== "" && weight > 0),
    ({ part }) => part,
  );
  return Object.fromEntries(
    Object.entries(partGroups).map(([part, members]) => [part, computeSurfaceTones(members ?? [])]),
  );
};
