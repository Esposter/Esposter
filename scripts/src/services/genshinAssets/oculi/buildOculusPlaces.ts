import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { OculusKindLabelIdMap } from "#src/services/genshinAssets/oculi/OculusKindLabelIdMap";
import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { GameDataset, OculusKind } from "genshin-world";

// Each region's Oculi as one slice of the oculi dataset, from the official map's points and the fit. The notes count
// Each region's Oculi and what was left out
export const buildOculusPlaces = async (): Promise<GameDataBuild> => {
  const [origin, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const labelIdKindMap = new Map(Object.values(OculusKind).map((kind) => [OculusKindLabelIdMap[kind], kind]));
  const placement = placeMapPoints(points, transform, labelIdKindMap, "oculus", origin);
  return buildMapPointSlices(GameDataset.Oculi, placement, "Oculi");
};
