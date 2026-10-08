import type { BaseLandmark } from "#src/models/world/BaseLandmark";

import { baseLandmarkSchema } from "#src/models/world/BaseLandmark";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { TreeSpecies } from "#src/models/world/TreeSpecies";
import { z } from "zod";

// A landmark tree, such as Windrise's great oak, built by the tree kit from its species' parameters
export interface TreeLandmark extends BaseLandmark {
  kind: LandmarkKind.Tree;
  species: TreeSpecies;
}

export const treeLandmarkSchema = baseLandmarkSchema.safeExtend({
  kind: z.literal(LandmarkKind.Tree),
  species: z.enum(TreeSpecies),
}) satisfies z.ZodType<TreeLandmark>;
