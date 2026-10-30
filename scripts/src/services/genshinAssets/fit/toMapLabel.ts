import type { MapLabel } from "#src/models/genshinAssets/world/MapLabel";
import type { WorldArea } from "#src/models/genshinAssets/world/WorldArea";
import type { GroundPoint } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

// A level-two area's label, at the mean of its outline's corners as the map's area labels sit (`computeAreaLabels`).
// Its name is held by the text id the table gives it
export const toMapLabel = (
  { areaID1, areaID2, areaNameTextMapHash }: Pick<WorldArea, "areaID1" | "areaID2" | "areaNameTextMapHash">,
  outline: readonly GroundPoint[],
): MapLabel => ({
  levelOneAreaId: areaID1,
  levelTwoAreaId: areaID2,
  nameTextId: String(areaNameTextMapHash),
  x: roundFitted(outline.reduce((sum, { x }) => sum + x, 0) / outline.length),
  z: roundFitted(outline.reduce((sum, { z }) => sum + z, 0) / outline.length),
});
