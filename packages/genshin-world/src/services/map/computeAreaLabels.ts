import type { MapAreaLabel } from "#src/models/map/MapAreaLabel";
import type { Landmark } from "#src/models/world/Landmark";

import { catalogue } from "#src/services/world/catalogue";

// Each area's name at the middle of its outline, or of its landmarks where its outline is not drawn yet, and no name
// For an area with neither, since the map has nowhere to put it
export const computeAreaLabels = (landmarks: readonly Landmark[]): MapAreaLabel[] =>
  catalogue.regions.flatMap(({ areas }) =>
    areas.flatMap(({ id, name, outline }) => {
      const points =
        outline.length > 0 ? outline : landmarks.filter(({ areaId }) => areaId === id).map(({ position }) => position);
      if (points.length === 0) return [];
      const x = points.reduce((sum, point) => sum + point.x, 0) / points.length;
      const z = points.reduce((sum, point) => sum + point.z, 0) / points.length;
      return [{ id, name, x, z }];
    }),
  );
