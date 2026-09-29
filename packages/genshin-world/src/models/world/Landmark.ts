import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { TreeLandmark } from "#src/models/world/TreeLandmark";

import { statueLandmarkSchema } from "#src/models/world/StatueLandmark";
import { treeLandmarkSchema } from "#src/models/world/TreeLandmark";
import { z } from "zod";

export type Landmark = StatueLandmark | TreeLandmark;

export const landmarkSchema = z.discriminatedUnion("kind", [
  statueLandmarkSchema,
  treeLandmarkSchema,
]) satisfies z.ZodType<Landmark>;
