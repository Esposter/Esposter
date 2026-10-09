import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { ChestKindLabelIdMap } from "#src/services/genshinAssets/chests/ChestKindLabelIdMap";
import { CHEST_PLACES_GENERATED_DIRECTORY } from "#src/services/genshinAssets/chests/constants";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { toRegionFramePlacement } from "#src/services/genshinAssets/points/toRegionFramePlacement";
import { writeMapPointSlices } from "#src/services/genshinAssets/points/writeMapPointSlices";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { ChestKind } from "genshin-world";

// Each region's chests written as one slice in the world's generated folder, from the official map's points and the
// Fit, each carried into its region's axes round the Windrise origin as the region's landmarks are. The report counts each
// Region's chests and what was left out
export const writeChestPlaces = async (): Promise<string> => {
  const [origin, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const labelIdKindMap = new Map(Object.values(ChestKind).map((kind) => [ChestKindLabelIdMap[kind], kind]));
  const placement = toRegionFramePlacement(placeMapPoints(points, transform, labelIdKindMap, "chest"), origin);
  return writeMapPointSlices(CHEST_PLACES_GENERATED_DIRECTORY, placement, "chests");
};
