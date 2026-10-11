import type { MapPointPlacement } from "#src/models/genshinAssets/points/MapPointPlacement";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";

// The official map's points of the labels given, fitted and placed in their regions round the Windrise origin, each
// Point as its kind and under the id prefix given
export const placeFittedMapPoints = async <Kind>(
  labelIdKindMap: ReadonlyMap<number, Kind>,
  idPrefix: string,
): Promise<MapPointPlacement<Kind>> => {
  const [origin, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  return placeMapPoints(points, transform, labelIdKindMap, idPrefix, origin);
};
