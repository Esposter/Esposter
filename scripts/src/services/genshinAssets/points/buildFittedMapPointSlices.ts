import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";
import type { GameDataset } from "genshin-world";

import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";

// The official map's points of the labels given, fitted and placed as one slice of the dataset, each under the id prefix
// Given, and each region's places passed through the mapper given before they are sliced. The notes count each region's
// Places under the noun, then what was left out, then what the report given says of the mapped places
export const buildFittedMapPointSlices = async <Kind>(
  dataset: GameDataset,
  labelIdKindMap: ReadonlyMap<number, Kind>,
  idPrefix: string,
  noun: string,
  mapRegionPlaces: (regionPlaces: MapPointPlace<Kind>[]) => MapPointPlace<Kind>[] = (regionPlaces) => regionPlaces,
  reportPlaces: (places: Readonly<Record<string, MapPointPlace<Kind>[]>>) => string[] = () => [],
): Promise<GameDataBuild> => {
  const placement = await placeFittedMapPoints(labelIdKindMap, idPrefix);
  const places = Object.fromEntries(
    Object.entries(placement.places).map(([region, regionPlaces]) => [region, mapRegionPlaces(regionPlaces)]),
  );
  const { notes, objects } = buildMapPointSlices(dataset, { ...placement, places }, noun);
  return { notes: [...notes, ...reportPlaces(places)], objects };
};
