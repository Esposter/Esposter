import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";
import type { MonumentKindTiming } from "#src/models/genshinAssets/puzzles/MonumentKindTiming";
import type { MonumentPlace, PuzzleKind } from "genshin-world";

import {
  PROVISIONAL_MONUMENT_ELEMENT,
  PROVISIONAL_MONUMENT_IS_TIMED,
} from "#src/services/genshinAssets/puzzles/constants";

// A monument mark with its element and timing: its kind's as the wiki gives them, and provisional for whichever the wiki
// Does not, so the place says which of its values a recording has yet to confirm
export const toMonumentPlace = (
  mark: MapPointPlace<PuzzleKind>,
  { element, isTimed }: MonumentKindTiming,
): MapPointPlace<PuzzleKind> & { monument: MonumentPlace } => ({
  ...mark,
  monument: {
    element: element ?? PROVISIONAL_MONUMENT_ELEMENT,
    isProvisional: element === undefined || isTimed === undefined,
    isTimed: isTimed ?? PROVISIONAL_MONUMENT_IS_TIMED,
  },
});
