import type { BaseLandmark } from "#src/models/world/BaseLandmark";
import type { TreeOptions } from "genshin-engine";

import { baseLandmarkSchema } from "#src/models/world/BaseLandmark";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { treeOptionsSchema } from "#src/models/world/treeOptionsSchema";
import { z } from "zod";

// A landmark tree, such as Windrise's great oak, built by the tree kit from its options
export interface TreeLandmark extends BaseLandmark {
  kind: LandmarkKind.Tree;
  treeOptions: TreeOptions;
}

export const treeLandmarkSchema = baseLandmarkSchema.safeExtend({
  kind: z.literal(LandmarkKind.Tree),
  treeOptions: treeOptionsSchema,
}) satisfies z.ZodType<TreeLandmark>;
