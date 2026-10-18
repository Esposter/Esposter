import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";

import { buildMapPointSlices } from "#src/services/genshinAssets/points/buildMapPointSlices";
import { placeFittedMapPoints } from "#src/services/genshinAssets/points/placeFittedMapPoints";
import { ELEMENTAL_MONUMENT_WIKI_TIMING } from "#src/services/genshinAssets/puzzles/constants";
import { PuzzleKindLabelIdsMap } from "#src/services/genshinAssets/puzzles/PuzzleKindLabelIdsMap";
import { toMonumentPlace } from "#src/services/genshinAssets/puzzles/toMonumentPlace";
import { GameDataset, PuzzleKind } from "genshin-world";

// Each Elemental Monument takes its element and timing with its place, as the wiki gives them for its kind
const withMonumentTiming = (place: MapPointPlace<PuzzleKind>): MapPointPlace<PuzzleKind> =>
  place.kind === PuzzleKind.ElementalMonument ? toMonumentPlace(place, ELEMENTAL_MONUMENT_WIKI_TIMING) : place;

// Each region's puzzle mechanisms as one slice of the puzzles dataset, from the official map's points and the fit. The
// Notes count each region's places and what was left out
export const buildPuzzlePlaces = async (): Promise<GameDataBuild> => {
  const labelIdKindMap = new Map(
    Object.values(PuzzleKind).flatMap((kind) => PuzzleKindLabelIdsMap[kind].map((labelId) => [labelId, kind] as const)),
  );
  const placement = await placeFittedMapPoints(labelIdKindMap, "puzzle");
  const places = Object.fromEntries(
    Object.entries(placement.places).map(([region, regionPlaces]) => [
      region,
      regionPlaces.map((place) => withMonumentTiming(place)),
    ]),
  );
  return buildMapPointSlices(GameDataset.Puzzles, { ...placement, places }, "puzzles");
};
