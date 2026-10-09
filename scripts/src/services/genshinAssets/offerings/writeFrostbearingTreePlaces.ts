import {
  FROSTBEARING_TREE_LABEL_ID,
  FROSTBEARING_TREE_PLACES_GENERATED_DIRECTORY,
} from "#src/services/genshinAssets/offerings/constants";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { writeMapPointSlices } from "#src/services/genshinAssets/points/writeMapPointSlices";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";

// The Frostbearing Tree's place in each region, from the official map's point and the fit, written as one slice per
// Region in the world's generated folder. The report counts each region's trees and what was left out
export const writeFrostbearingTreePlaces = async (): Promise<string> => {
  const [origin, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const placement = placeMapPoints(
    points,
    transform,
    new Map([[FROSTBEARING_TREE_LABEL_ID, "FrostbearingTree"]]),
    "tree",
    origin,
  );
  return writeMapPointSlices(FROSTBEARING_TREE_PLACES_GENERATED_DIRECTORY, placement, "Frostbearing Tree");
};
