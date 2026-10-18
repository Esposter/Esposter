import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";

import { buildFittedMapPointSlices } from "#src/services/genshinAssets/points/buildFittedMapPointSlices";
import { ELEMENTAL_MONUMENT_WIKI_TIMING, SEELIE_WIKI_COUNTS } from "#src/services/genshinAssets/puzzles/constants";
import { PuzzleKindLabelIdsMap } from "#src/services/genshinAssets/puzzles/PuzzleKindLabelIdsMap";
import { toMonumentPlace } from "#src/services/genshinAssets/puzzles/toMonumentPlace";
import { toSeeliePlace } from "#src/services/genshinAssets/puzzles/toSeeliePlace";
import { GameDataset, PuzzleKind } from "genshin-world";

// Each Elemental Monument takes its element and timing with its place, as the wiki gives them for its kind
const withMonumentTiming = (place: MapPointPlace<PuzzleKind>): MapPointPlace<PuzzleKind> =>
  place.kind === PuzzleKind.ElementalMonument ? toMonumentPlace(place, ELEMENTAL_MONUMENT_WIKI_TIMING) : place;

// Each Seelie takes whether its region's court is on the map, since a Seelie with none to be led to is provisional
const withSeelieCourt = (regionPlaces: MapPointPlace<PuzzleKind>[]): MapPointPlace<PuzzleKind>[] => {
  const hasCourt = regionPlaces.some(({ kind }) => kind === PuzzleKind.SeelieCourt);
  return regionPlaces.map((place) => (place.kind === PuzzleKind.Seelie ? toSeeliePlace(place, hasCourt) : place));
};

// Each region's Seelie count set against the wiki's, so a region the map and the wiki count apart shows in the dry run
const computeSeelieCountNotes = (places: Readonly<Record<string, MapPointPlace<PuzzleKind>[]>>): string[] =>
  Object.entries(SEELIE_WIKI_COUNTS).map(([region, wikiCount]) => {
    const count = (places[region] ?? []).filter(({ kind }) => kind === PuzzleKind.Seelie).length;
    return `${region}: ${count} Seelie places against the wiki's ${wikiCount}`;
  });

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
    (regionPlaces) => withSeelieCourt(regionPlaces).map((place) => withMonumentTiming(place)),
    computeSeelieCountNotes,
  );
