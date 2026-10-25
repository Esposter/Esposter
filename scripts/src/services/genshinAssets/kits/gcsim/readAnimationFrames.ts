import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

import { checkIsGoFloat } from "#src/services/genshinAssets/kits/gcsim/checkIsGoFloat";

// A frames constant's animation length, where the constant is one set of frames
export const readAnimationFrames = (value: GoValue | undefined): number | undefined =>
  typeof value === "object" && !Array.isArray(value) && !checkIsGoFloat(value) ? value.animationFrames : undefined;
