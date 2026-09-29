import type { StatueLandmark } from "@/models/genshin/world/StatueLandmark";
import type { TreeLandmark } from "@/models/genshin/world/TreeLandmark";

import { statueLandmarkSchema } from "@/models/genshin/world/StatueLandmark";
import { treeLandmarkSchema } from "@/models/genshin/world/TreeLandmark";
import { z } from "zod";

export type Landmark = StatueLandmark | TreeLandmark;

export const landmarkSchema = z.discriminatedUnion("kind", [
  statueLandmarkSchema,
  treeLandmarkSchema,
]) satisfies z.ZodType<Landmark>;
