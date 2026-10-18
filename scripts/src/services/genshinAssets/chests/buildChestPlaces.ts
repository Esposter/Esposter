import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { ChestKindLabelIdMap } from "#src/services/genshinAssets/chests/ChestKindLabelIdMap";
import { ChestWikiCountMap } from "#src/services/genshinAssets/chests/ChestWikiCountMap";
import { buildFittedMapPointSlices } from "#src/services/genshinAssets/points/buildFittedMapPointSlices";
import { reportKindCount } from "#src/services/genshinAssets/points/reportKindCount";
import { ChestKind, GameDataset } from "genshin-world";

// Each region's chests as one slice of the chests dataset, from the official map's points and the fit, each carried
// Into its region's axes round the Windrise origin as the region's landmarks are. The notes count each region's chests
// Against the wiki's count, then what was left out
export const buildChestPlaces = (): Promise<GameDataBuild> =>
  buildFittedMapPointSlices(
    GameDataset.Chests,
    new Map(Object.values(ChestKind).map((kind) => [ChestKindLabelIdMap[kind], kind])),
    "chest",
    "chests",
    (regionPlaces) => regionPlaces,
    (places) =>
      Object.entries(ChestWikiCountMap).flatMap(([region, wikiCount]) => {
        const note = reportKindCount(region, "chests", places[region]?.length ?? 0, wikiCount);
        return note ? [note] : [];
      }),
  );
