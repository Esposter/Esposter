import type { ClipMotion } from "#src/models/genshinAssets/motion/ClipMotion";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { computeClipMotion } from "#src/services/genshinAssets/motion/computeClipMotion";
import { readComponentClips } from "#src/services/genshinAssets/shared/readComponentClips";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The motion of the clips `clips` wrote for a component, read from its JSON, those whose names a pattern matches
export const readClipMotions = async (component: DerivedAssetComponent, clipPattern: string): Promise<ClipMotion[]> => {
  const pattern = new RegExp(clipPattern, "u");
  const motions = (await readComponentClips(component))
    .filter(({ name }) => pattern.test(name))
    .map((clip) => computeClipMotion(clip));
  if (motions.length === 0) throw new InvalidOperationError(Operation.Read, clipPattern, `in no clip of ${component}`);
  return motions;
};
