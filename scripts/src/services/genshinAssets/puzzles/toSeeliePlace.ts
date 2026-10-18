import type { MapPointPlace } from "#src/models/genshinAssets/points/MapPointPlace";
import type { PuzzleKind } from "genshin-world";

// A Seelie place with whether its region has a court on the map. Without one it has no court to be led to, so the place is
// Provisional until a court source gives one
export const toSeeliePlace = (
  mark: MapPointPlace<PuzzleKind>,
  hasCourt: boolean,
): MapPointPlace<PuzzleKind> & { seelie: { isProvisional: boolean } } => ({
  ...mark,
  seelie: { isProvisional: !hasCourt },
});
