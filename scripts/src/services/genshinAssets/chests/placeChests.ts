import type { ChestPlacement } from "#src/models/genshinAssets/chests/ChestPlacement";
import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { ChestPlace } from "genshin-world";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { ChestKindLabelIdMap } from "#src/services/genshinAssets/chests/ChestKindLabelIdMap";
import { GROUND_LAYER } from "#src/services/genshinAssets/chests/constants";
import { InteractiveMapRegionMap } from "#src/services/genshinAssets/points/InteractiveMapRegionMap";
import { applySimilarityTransform } from "#src/services/genshinAssets/points/applySimilarityTransform";
import { ChestKind } from "genshin-world";

// Every chest the official map marks, carried into the game's coordinates by the fit's transform and kept by region. A
// Point on a layer under the ground is left out for now, and so is one in an area no region is mapped to, each counted
// So the report says what was not placed. The other labels on the map are none of its business
export const placeChests = (points: readonly InteractiveMapPoint[], transform: SimilarityTransform): ChestPlacement => {
  const kindByLabelId = new Map(Object.values(ChestKind).map((kind) => [ChestKindLabelIdMap[kind], kind]));
  const regionByAreaId = new Map(
    Object.entries(InteractiveMapRegionMap).map(([region, { areaId }]) => [areaId, region]),
  );
  const regionPlaces = new Map<string, ChestPlace[]>();
  const placement: ChestPlacement = { places: {}, skippedUnderground: 0, skippedUnmapped: 0 };
  for (const point of points) {
    const kind = kindByLabelId.get(point.label_id);
    if (kind === undefined) continue;
    if (point.z_level !== GROUND_LAYER) {
      placement.skippedUnderground++;
      continue;
    }
    const region = regionByAreaId.get(point.area_id);
    if (region === undefined) {
      placement.skippedUnmapped++;
      continue;
    }
    const position = applySimilarityTransform(transform, { x: point.x_pos, z: point.y_pos });
    regionPlaces.set(region, [
      ...(regionPlaces.get(region) ?? []),
      { id: `chest-${point.id}`, kind, position: { x: roundFitted(position.x), z: roundFitted(position.z) } },
    ]);
  }
  placement.places = Object.fromEntries(regionPlaces);
  return placement;
};
