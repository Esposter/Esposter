import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";
import type { GameDataset } from "genshin-world";

import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";

// The official map's points of the labels given, fitted and placed as one slice of the dataset, each under the id prefix
// Given, and each place passed through the mapper given before it is sliced. The notes count each region's places under
// The noun, then what was left out
export const buildFittedMapPointSlices = async <Kind>(
  dataset: GameDataset,
  labelIdKindMap: ReadonlyMap<number, Kind>,
  idPrefix: string,
  noun: string,
  mapPlace: (place: MapPointPlace<Kind>) => MapPointPlace<Kind> = (place) => place,
): Promise<GameDataBuild> => {
  const placement = await placeFittedMapPoints(labelIdKindMap, idPrefix);
  const places = Object.fromEntries(
    Object.entries(placement.places).map(([region, regionPlaces]) => [
      region,
      regionPlaces.map((place) => mapPlace(place)),
    ]),
  );
  return buildMapPointSlices(dataset, { ...placement, places }, noun);
};
