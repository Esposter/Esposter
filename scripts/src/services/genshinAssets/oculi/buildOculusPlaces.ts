import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { OculusKindLabelIdMap } from "#src/services/genshinAssets/oculi/OculusKindLabelIdMap";
import { buildFittedMapPointSlices } from "#src/services/genshinAssets/points/buildFittedMapPointSlices";
import { InteractiveMapRegionMap } from "#src/services/genshinAssets/points/InteractiveMapRegionMap";
import { reportKindCount } from "#src/services/genshinAssets/points/reportKindCount";
import { GameDataset, OculusKind } from "genshin-world";

// Each region's Oculi as one slice of the oculi dataset, from the official map's points and the fit. The notes count
// Each region's Oculi and what was left out, then each region whose count differs from the wiki's; a match reports
// Nothing
export const buildOculusPlaces = (): Promise<GameDataBuild> =>
  buildFittedMapPointSlices(
    GameDataset.Oculi,
    new Map(Object.values(OculusKind).map((kind) => [OculusKindLabelIdMap[kind], kind])),
    "oculus",
    "Oculi",
    (regionPlaces) => regionPlaces,
    (places) =>
      Object.entries(InteractiveMapRegionMap).flatMap(([region, { oculus }]) => {
        const note = reportKindCount(region, "Oculi", places[region]?.length ?? 0, oculus.count);
        return note ? [note] : [];
      }),
  );
