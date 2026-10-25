import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";

import { ELEMENTAL_MONUMENT_WIKI_TIMING } from "#src/services/genshinAssets/puzzles/constants";
import { toMonumentPlace } from "#src/services/genshinAssets/puzzles/toMonumentPlace";
import { PuzzleKind } from "genshin-world";

// Each Elemental Monument takes its element and timing with its place, as the wiki gives them for its kind
export const withMonumentTiming = (place: MapPointPlace<PuzzleKind>): MapPointPlace<PuzzleKind> =>
  place.kind === PuzzleKind.ElementalMonument ? toMonumentPlace(place, ELEMENTAL_MONUMENT_WIKI_TIMING) : place;
