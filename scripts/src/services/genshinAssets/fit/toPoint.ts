import type { WaterfallSheetRecord } from "#src/models/genshinAssets/fit/WaterfallSheetRecord";
import type { Vector3 } from "three";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

// A rounded negative zero is written as zero, so a point on an axis reads the same whichever way its sign fell
export const toPoint = ({ x, y, z }: Vector3): WaterfallSheetRecord["lip"] => ({
  x: roundFitted(x) || 0,
  y: roundFitted(y) || 0,
  z: roundFitted(z) || 0,
});
