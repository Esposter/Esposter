import type { GameDataBuild } from "#src/models/shared/GameDataBuild";

import { buildFittedMapPointSlices } from "#src/services/genshinAssets/points/buildFittedMapPointSlices";
import { computeSeelieCountNotes } from "#src/services/genshinAssets/puzzles/computeSeelieCountNotes";
import { PuzzleKindLabelIdsMap } from "#src/services/genshinAssets/puzzles/PuzzleKindLabelIdsMap";
import { withMonumentTiming } from "#src/services/genshinAssets/puzzles/withMonumentTiming";
import { withSeelieCourt } from "#src/services/genshinAssets/puzzles/withSeelieCourt";
import { GameDataset, PuzzleKind } from "genshin-world";

// Each region's puzzle mechanisms as one slice of the puzzles dataset, from the official map's points and the fit. The
// Notes count each region's places and what was left out, then each region's Seelies against the wiki's
export const buildPuzzlePlaces = (): Promise<GameDataBuild> =>
  buildFittedMapPointSlices(
    GameDataset.Puzzles,
    new Map(
      Object.values(PuzzleKind).flatMap((kind) =>
        PuzzleKindLabelIdsMap[kind].map((labelId) => [labelId, kind] as const),
      ),
    ),
    "puzzle",
    "puzzles",
    {
      mapRegionPlaces: (regionPlaces) => withSeelieCourt(regionPlaces).map((place) => withMonumentTiming(place)),
      reportPlaces: computeSeelieCountNotes,
    },
  );
