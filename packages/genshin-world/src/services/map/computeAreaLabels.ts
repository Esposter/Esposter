import type { MapAreaLabel } from "#src/models/map/MapAreaLabel";
import type { Landmark } from "#src/models/world/Landmark";

import { computeFilledAreaIds } from "#src/services/map/computeFilledAreaIds";
import { catalogue } from "#src/services/world/catalogue";

// Each filled area's name at the middle of its outline, or of its unlocked landmarks where its outline is not drawn yet,
// And no name for an area with neither, since the map has nowhere to put it. A blank area carries no name
export const computeAreaLabels = (unlockedLandmarks: readonly Landmark[]): MapAreaLabel[] => {
  const filledAreaIds = computeFilledAreaIds(unlockedLandmarks);
  return catalogue.regions.flatMap(({ areas }) =>
    areas.flatMap(({ id, name, outline }) => {
      if (!filledAreaIds.has(id)) return [];
      const points =
        outline.length > 0
          ? outline
          : unlockedLandmarks.filter(({ areaId }) => areaId === id).map(({ position }) => position);
      if (points.length === 0) return [];
      const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;
      const z = points.reduce((sum, point) => sum + point.z, 0) / points.length;
      return [{ id, name, x, z }];
    }),
  );
};
