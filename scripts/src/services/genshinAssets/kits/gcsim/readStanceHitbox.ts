import type { GcsimHitbox } from "#src/models/genshinAssets/kits/gcsim/GcsimHitbox";
import type { GoConstant } from "#src/models/genshinAssets/kits/gcsim/GoConstant";

import { GcsimHitboxCenter } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxCenter";
import { GcsimHitboxShape } from "#src/models/genshinAssets/kits/gcsim/GcsimHitboxShape";
import { readGoNumber } from "#src/services/genshinAssets/kits/gcsim/readGoNumber";
import { toGoNumbers } from "#src/services/genshinAssets/kits/gcsim/toGoNumbers";

// A stance's strike box as gcsim's attack state gives it: a box round the body at that state's forward offset, from the
// State's list of boxes and the state's offset
export const readStanceHitbox = (
  boxes: GoConstant | undefined,
  offsets: GoConstant | undefined,
  state: number,
  strikeIndex: number,
): GcsimHitbox | undefined => {
  if (boxes === undefined || offsets === undefined) return undefined;
  const stateBoxes = Array.isArray(boxes.value) ? boxes.value[state] : undefined;
  const [width, length] = toGoNumbers(Array.isArray(stateBoxes) ? stateBoxes[strikeIndex] : undefined) ?? [];
  const forward = readGoNumber(Array.isArray(offsets.value) ? offsets.value[state] : undefined);
  if (width === undefined || length === undefined || forward === undefined) return undefined;
  return {
    box: [width, length],
    center: GcsimHitboxCenter.Player,
    file: boxes.file,
    line: boxes.elementLines[state] ?? boxes.line,
    name: `N${strikeIndex + 1}`,
    offset: [0, forward],
    shape: GcsimHitboxShape.Box,
  };
};
