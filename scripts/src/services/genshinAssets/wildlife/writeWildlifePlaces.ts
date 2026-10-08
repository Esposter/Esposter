import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { writeMapPointSlices } from "#src/services/genshinAssets/points/writeMapPointSlices";
import { WILDLIFE_PLACES_GENERATED_DIRECTORY } from "#src/services/genshinAssets/wildlife/constants";
import { WildlifeKindLabelIdMap } from "#src/services/genshinAssets/wildlife/WildlifeKindLabelIdMap";
import { WildlifeKind } from "genshin-world";

// Each region's animals of the kinds the map marks as fleeing birds and beasts written as one slice in the world's
// Generated folder, from the official map's points and the fit. The report counts each region's animals and what was left out
export const writeWildlifePlaces = async (): Promise<string> => {
  const { points, transform } = await readFittedMapPoints();
  const labelIdKindMap = new Map(Object.values(WildlifeKind).map((kind) => [WildlifeKindLabelIdMap[kind], kind]));
  const placement = placeMapPoints(points, transform, labelIdKindMap, "wildlife");
  return writeMapPointSlices(WILDLIFE_PLACES_GENERATED_DIRECTORY, placement, "animals");
};
