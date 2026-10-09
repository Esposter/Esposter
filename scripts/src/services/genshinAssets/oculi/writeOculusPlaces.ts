import { OCULI_PLACES_GENERATED_DIRECTORY } from "#src/services/genshinAssets/oculi/constants";
import { OculusKindLabelIdMap } from "#src/services/genshinAssets/oculi/OculusKindLabelIdMap";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { writeMapPointSlices } from "#src/services/genshinAssets/points/writeMapPointSlices";
import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { OculusKind } from "genshin-world";

// Each region's Oculi written as one slice in the world's generated folder, from the official map's points and the fit.
// The report counts each region's Oculi and what was left out
export const writeOculusPlaces = async (): Promise<string> => {
  const [origin, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const labelIdKindMap = new Map(Object.values(OculusKind).map((kind) => [OculusKindLabelIdMap[kind], kind]));
  const placement = placeMapPoints(points, transform, labelIdKindMap, "oculus", origin);
  return writeMapPointSlices(OCULI_PLACES_GENERATED_DIRECTORY, placement, "Oculi");
};
