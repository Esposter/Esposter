import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";

import { toSeeliePlace } from "#src/services/genshinAssets/puzzles/toSeeliePlace";
import { PuzzleKind } from "genshin-world";

// Each Seelie takes whether its region's court is on the map, since a Seelie with none to be led to is provisional
export const withSeelieCourt = (regionPlaces: MapPointPlace<PuzzleKind>[]): MapPointPlace<PuzzleKind>[] => {
  const hasCourt = regionPlaces.some(({ kind }) => kind === PuzzleKind.SeelieCourt);
  return regionPlaces.map((place) => (place.kind === PuzzleKind.Seelie ? toSeeliePlace(place, hasCourt) : place));
};
