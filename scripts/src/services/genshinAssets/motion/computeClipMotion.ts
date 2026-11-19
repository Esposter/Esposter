import type { ClipMotion } from "#src/models/genshinAssets/motion/ClipMotion";
import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";
import type { DecodedCurve } from "#src/models/genshinAssets/shared/DecodedCurve";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";

// How far a curve's path sits below the animator: the animator's own transform is depth zero, and any other path is one
// Level for each of its segments
const getDepth = ({ path, pathHash }: DecodedCurve): number => (pathHash === 0 ? 0 : path.split("/").length);

// A clip's motion read off its decoded position curves. The root is the one path at the top of the hierarchy the clip
// Moves, and its translation is the distance from its first sample to its last. Several paths at the top, or a curve
// ACL compressed so none of its samples decoded, leave no single root to read, so the translation is undefined
export const computeClipMotion = ({ curves, duration, name }: DecodedClip): ClipMotion => {
  const positions = curves.filter(({ property, type }) => type === AssetType.Transform && property === "position");
  const topDepth = Math.min(...positions.map((curve) => getDepth(curve)));
  const roots = positions.filter((curve) => getDepth(curve) === topDepth);
  const hasSingleRoot = new Set(roots.map(({ pathHash }) => pathHash)).size === 1;
  const isDecoded = roots.every(({ samples }) => samples.length > 0);
  const rootTranslation =
    hasSingleRoot && isDecoded
      ? Math.hypot(...roots.map(({ samples }) => (samples.at(-1) ?? 0) - (samples[0] ?? 0)))
      : undefined;
  return {
    duration,
    name,
    rootTranslation,
    speed: rootTranslation !== undefined && rootTranslation > 0 ? rootTranslation / duration : undefined,
  };
};
