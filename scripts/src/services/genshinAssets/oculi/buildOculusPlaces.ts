import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { OculusKindLabelIdMap } from "#src/services/genshinAssets/oculi/OculusKindLabelIdMap";
import { buildFittedMapPointSlices } from "#src/services/genshinAssets/points/buildFittedMapPointSlices";
import { GameDataset, OculusKind } from "genshin-world";

// Each region's Oculi as one slice of the oculi dataset, from the official map's points and the fit. The notes count
// Each region's Oculi and what was left out
export const buildOculusPlaces = (): Promise<GameDataBuild> =>
  buildFittedMapPointSlices(
    GameDataset.Oculi,
    new Map(Object.values(OculusKind).map((kind) => [OculusKindLabelIdMap[kind], kind])),
    "oculus",
    "Oculi",
  );
