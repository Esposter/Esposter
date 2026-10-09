import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { writeMapPointSlices } from "#src/services/genshinAssets/points/writeMapPointSlices";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { WILDLIFE_PLACES_GENERATED_DIRECTORY } from "#src/services/genshinAssets/wildlife/constants";
import { WildlifeKindLabelIdMap } from "#src/services/genshinAssets/wildlife/WildlifeKindLabelIdMap";
import { WildlifeKind } from "genshin-world";

// Each region's animals of the kinds the map marks as fleeing birds and beasts written as one slice in the world's
// Generated folder, from the official map's points and the fit. The report counts each region's animals and what was left out
export const writeWildlifePlaces = async (): Promise<string> => {
  const [origin, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const labelIdKindMap = new Map(Object.values(WildlifeKind).map((kind) => [WildlifeKindLabelIdMap[kind], kind]));
  const placement = placeMapPoints(points, transform, labelIdKindMap, "wildlife", origin);
  return writeMapPointSlices(WILDLIFE_PLACES_GENERATED_DIRECTORY, placement, "animals");
};
