import type { PathPoint } from "#src/models/genshinAssets/fit/PathPoint";
import type { SkeletonNode } from "#src/models/genshinAssets/fit/SkeletonNode";

export const toPathPoint = ({ centre: [x, y, z], radius }: SkeletonNode): PathPoint => [x, y, z, radius];
