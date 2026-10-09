import { ChestKindLabelIdMap } from "#src/services/genshinAssets/chests/ChestKindLabelIdMap";
import { CHEST_PLACES_GENERATED_DIRECTORY } from "#src/services/genshinAssets/chests/constants";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { writeMapPointSlices } from "#src/services/genshinAssets/points/writeMapPointSlices";
import { ChestKind } from "genshin-world";

// Each region's chests written as one slice in the world's generated folder, from the official map's points and the fit.
// The report counts each region's chests and what was left out
export const writeChestPlaces = async (): Promise<string> => {
  const { points, transform } = await readFittedMapPoints();
  const labelIdKindMap = new Map(Object.values(ChestKind).map((kind) => [ChestKindLabelIdMap[kind], kind]));
  const placement = placeMapPoints(points, transform, labelIdKindMap, "chest");
  return writeMapPointSlices(CHEST_PLACES_GENERATED_DIRECTORY, placement, "chests");
};
