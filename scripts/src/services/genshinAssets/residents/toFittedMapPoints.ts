import type { InteractiveMapFitFile } from "#src/models/genshinAssets/points/InteractiveMapFitFile";
import type { InteractiveMapPoint } from "#src/models/genshinAssets/points/InteractiveMapPoint";
import type { SimilarityTransform } from "#src/models/genshinAssets/points/SimilarityTransform";

import { toRegionMapPoints } from "#src/services/genshinAssets/residents/toRegionMapPoints";

// The regions the fit placed, and the official map's ground points in those regions carried into the game's axes. A region
// The fit matched no statue or waypoint in is left out, since a place classified into it cannot be trusted
export const toFittedMapPoints = ({
  points,
  regions,
  transform,
}: {
  points: InteractiveMapPoint[];
  regions: InteractiveMapFitFile["regions"];
  transform: SimilarityTransform;
}) => {
  const fittedRegions = regions.filter(({ residual }) => residual !== undefined);
  const regionMapPoints = toRegionMapPoints(points, transform).filter(({ region }) =>
    fittedRegions.some((fitted) => fitted.region === region),
  );
  return { fittedRegions, regionMapPoints };
};
