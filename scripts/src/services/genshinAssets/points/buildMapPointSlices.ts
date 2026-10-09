import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { MapPointPlacement } from "#src/models/genshinAssets/points/MapPointPlacement";
import type { GameDataset } from "genshin-world";

// Each region's places as one record of the dataset, keyed by the region. A publish under the dataset's scope replaces
// The whole set, as the folder rewrite it replaces did. The notes count each region's places under the noun, then what
// Was left out
export const buildMapPointSlices = <Kind>(
  dataset: GameDataset,
  placement: MapPointPlacement<Kind>,
  noun: string,
): GameDataBuild => {
  const regions = Object.entries(placement.places).toSorted(([firstRegion], [secondRegion]) =>
    firstRegion.localeCompare(secondRegion),
  );
  return {
    notes: [
      ...regions.map(([region, regionPlaces]) => `${region}: ${regionPlaces.length} ${noun}`),
      `${placement.skippedUnderground} on the layers under the ground and ${placement.skippedUnmapped} in no mapped region, left out`,
    ],
    objects: Object.fromEntries(regions.map(([region, regionPlaces]) => [`${dataset}/${region}`, regionPlaces])),
  };
};
