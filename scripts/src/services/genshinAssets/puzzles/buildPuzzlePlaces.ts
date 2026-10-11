import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";

import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";
import { PuzzleKindLabelIdsMap } from "#src/services/genshinAssets/puzzles/PuzzleKindLabelIdsMap";
import { GameDataset, PuzzleKind } from "genshin-world";

// Each region's puzzle mechanisms as one slice of the puzzles dataset, from the official map's points and the fit. The
// Notes count each region's places and what was left out
export const buildPuzzlePlaces = async (): Promise<GameDataBuild> => {
  const labelIdKindMap = new Map(
    Object.values(PuzzleKind).flatMap((kind) => PuzzleKindLabelIdsMap[kind].map((labelId) => [labelId, kind] as const)),
  );
  const placement = await placeFittedMapPoints(labelIdKindMap, "puzzle");
  return buildMapPointSlices(GameDataset.Puzzles, placement, "puzzles");
};
