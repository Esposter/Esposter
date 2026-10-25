import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";

import { SEELIE_WIKI_COUNTS } from "#src/services/genshinAssets/puzzles/constants";
import { PuzzleKind } from "genshin-world";

// Each region's Seelie count set against the wiki's, so a region the map and the wiki count apart shows in the dry run
export const computeSeelieCountNotes = (places: Readonly<Record<string, MapPointPlace<PuzzleKind>[]>>): string[] =>
  Object.entries(SEELIE_WIKI_COUNTS).map(([region, wikiCount]) => {
    const count = (places[region] ?? []).filter(({ kind }) => kind === PuzzleKind.Seelie).length;
    return `${region}: ${count} Seelie places against the wiki's ${wikiCount}`;
  });
