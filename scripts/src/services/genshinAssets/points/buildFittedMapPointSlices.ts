import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { GameDataset } from "genshin-world";

import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";

// The official map's points of the labels given, fitted and placed as one slice of the dataset, each under the id prefix
// Given. The notes count each region's places under the noun, then what was left out
export const buildFittedMapPointSlices = async <Kind>(
  dataset: GameDataset,
  labelIdKindMap: ReadonlyMap<number, Kind>,
  idPrefix: string,
  noun: string,
): Promise<GameDataBuild> => buildMapPointSlices(dataset, await placeFittedMapPoints(labelIdKindMap, idPrefix), noun);
