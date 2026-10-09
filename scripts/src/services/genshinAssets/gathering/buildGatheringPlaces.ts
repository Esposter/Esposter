import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readGatheringItems } from "#src/services/genshinAssets/gathering/readGatheringItems";
import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { readInteractiveMapLabels } from "#src/services/genshinAssets/points/readInteractiveMapLabels";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { GameDataset } from "genshin-world";

// Each region's gathering points as one slice of the gathering dataset: each point the official map marks of a
// Gathering item and placed by the fit, with the items they give as one record beside them. A point's kind is its
// Item's id. The notes count each region's points, what was left out and the items
export const buildGatheringPlaces = async (): Promise<GameDataBuild> => {
  const [origin, labels, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readInteractiveMapLabels(),
    readFittedMapPoints(),
  ]);
  const { items, labelItemIdMap } = await readGatheringItems(labels);
  const placement = placeMapPoints(points, transform, labelItemIdMap, "gathering", origin);
  const slices = buildMapPointSlices(GameDataset.Gathering, placement, "gathering points");
  return {
    notes: [...slices.notes, `${items.length} gathering items`],
    objects: { ...slices.objects, [`${GameDataset.Gathering}/items`]: items },
  };
};
