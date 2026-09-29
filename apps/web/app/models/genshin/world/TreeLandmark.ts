import type { LandmarkBase } from "@/models/genshin/world/LandmarkBase";
import type { TreeOptions } from "genshin-engine";

import { landmarkBaseSchema } from "@/models/genshin/world/LandmarkBase";
import { LandmarkKind } from "@/models/genshin/world/LandmarkKind";
import { treeOptionsSchema } from "@/models/genshin/world/treeOptionsSchema";
import { z } from "zod";

// A landmark tree, such as Windrise's great oak, built by the tree kit from its options
export interface TreeLandmark extends LandmarkBase {
  kind: LandmarkKind.Tree;
  treeOptions: TreeOptions;
}

export const treeLandmarkSchema = landmarkBaseSchema.safeExtend({
  kind: z.literal(LandmarkKind.Tree),
  treeOptions: treeOptionsSchema,
}) satisfies z.ZodType<TreeLandmark>;
