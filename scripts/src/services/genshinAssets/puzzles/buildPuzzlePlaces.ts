import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeMapPoints } from "#src/services/genshinAssets/points/placeMapPoints";
import { readFittedMapPoints } from "#src/services/genshinAssets/points/readFittedMapPoints";
import { PuzzleKindLabelIdsMap } from "#src/services/genshinAssets/puzzles/PuzzleKindLabelIdsMap";
import { readWorldOrigin } from "#src/services/genshinAssets/world/readWorldOrigin";
import { GameDataset, PuzzleKind } from "genshin-world";

// Each region's puzzle mechanisms as one slice of the puzzles dataset, from the official map's points and the fit. The
// Notes count each region's places and what was left out
export const buildPuzzlePlaces = async (): Promise<GameDataBuild> => {
  const [origin, { points, transform }] = await Promise.all([
    readWorldOrigin(DerivedAssetComponent.Windrise),
    readFittedMapPoints(),
  ]);
  const labelIdKindMap = new Map(
    Object.values(PuzzleKind).flatMap((kind) => PuzzleKindLabelIdsMap[kind].map((labelId) => [labelId, kind] as const)),
  );
  const placement = placeMapPoints(points, transform, labelIdKindMap, "puzzle", origin);
  return buildMapPointSlices(GameDataset.Puzzles, placement, "puzzles");
};
