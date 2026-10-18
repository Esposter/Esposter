import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";
import type { OutcropPlacement } from "genshin-world";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { applySimilarityTransform } from "#src/services/genshinAssets/points/applySimilarityTransform";
import { GROUND_LAYER, INTERACTIVE_MAP_OUTCROP_LABEL_ID } from "#src/services/genshinAssets/points/constants";
import { toRegionAxesPosition } from "#src/services/genshinAssets/shared/toRegionAxesPosition";

// The ground Ley Line Blossom points of one map area, each carried into the game's coordinates by the fit's transform and
// Then into its region's axes round the origin, as the region's waypoints are. A point on a layer under the ground is left
// Out, as the other places of the map are, and each keeps its map point's id, which its outcrop is known by
export const toOutcropPlaces = ({
  areaId,
  mapPoints,
  origin,
  transform,
}: {
  areaId: number;
  mapPoints: readonly InteractiveMapPoint[];
  origin: readonly [number, number, number];
  transform: SimilarityTransform;
}): OutcropPlacement[] =>
  mapPoints
    .filter(
      ({ area_id, label_id, z_level }) =>
        area_id === areaId && label_id === INTERACTIVE_MAP_OUTCROP_LABEL_ID && z_level === GROUND_LAYER,
    )
    .map(({ id, x_pos, y_pos }) => {
      const position = toRegionAxesPosition(applySimilarityTransform(transform, { x: x_pos, z: y_pos }), origin);
      return { id, position: { x: roundFitted(position.x), z: roundFitted(position.z) } };
    });
