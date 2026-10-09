import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";
import type { MapPointPlacement } from "#src/models/genshinAssets/points/MapPointPlacement";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { applySimilarityTransform } from "#src/services/genshinAssets/points/applySimilarityTransform";
import { GROUND_LAYER } from "#src/services/genshinAssets/points/constants";
import { InteractiveMapRegionMap } from "#src/services/genshinAssets/points/InteractiveMapRegionMap";

// Every point of the kinds the label map names, carried into the game's coordinates by the fit's transform and then into
// Its region's axes round the Windrise origin, each id under the given prefix. A point on a layer under the ground is left
// Out for now, and so is one in an area no region is mapped to, each counted so the report says what was not placed. The
// Other labels are none of its business
export const placeMapPoints = <Kind>(
  points: readonly InteractiveMapPoint[],
  transform: SimilarityTransform,
  labelIdKindMap: ReadonlyMap<number, Kind>,
  idPrefix: string,
  [originX, , originZ]: readonly [number, number, number],
): MapPointPlacement<Kind> => {
  const areaIdRegionMap = new Map(
    Object.entries(InteractiveMapRegionMap).map(([region, { areaId }]) => [areaId, region]),
  );
  const regionPlaces = new Map<string, MapPointPlace<Kind>[]>();
  const placement: MapPointPlacement<Kind> = { places: {}, skippedUnderground: 0, skippedUnmapped: 0 };
  for (const point of points) {
    const kind = labelIdKindMap.get(point.label_id);
    if (kind === undefined) continue;
    if (point.z_level !== GROUND_LAYER) {
      placement.skippedUnderground++;
      continue;
    }
    const region = areaIdRegionMap.get(point.area_id);
    if (region === undefined) {
      placement.skippedUnmapped++;
      continue;
    }
    const fitted = applySimilarityTransform(transform, { x: point.x_pos, z: point.y_pos });
    const position = { x: roundFitted(fitted.x), z: roundFitted(fitted.z) };
    regionPlaces.set(region, [
      ...(regionPlaces.get(region) ?? []),
      {
        id: `${idPrefix}-${point.id}`,
        kind,
        position: { x: roundFitted(position.x - originX), z: roundFitted(originZ - position.z) },
      },
    ]);
  }
  placement.places = Object.fromEntries(regionPlaces);
  return placement;
};
