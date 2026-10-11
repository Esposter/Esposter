import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { OculusKindLabelIdMap } from "#src/services/genshinAssets/oculi/OculusKindLabelIdMap";
import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";
import { GameDataset, OculusKind } from "genshin-world";

// Each region's Oculi as one slice of the oculi dataset, from the official map's points and the fit. The notes count
// Each region's Oculi and what was left out
export const buildOculusPlaces = async (): Promise<GameDataBuild> => {
  const labelIdKindMap = new Map(Object.values(OculusKind).map((kind) => [OculusKindLabelIdMap[kind], kind]));
  const placement = await placeFittedMapPoints(labelIdKindMap, "oculus");
  return buildMapPointSlices(GameDataset.Oculi, placement, "Oculi");
};
