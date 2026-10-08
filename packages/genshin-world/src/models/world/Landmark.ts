import type { BuildingLandmark } from "#src/models/world/BuildingLandmark";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { TreeLandmark } from "#src/models/world/TreeLandmark";

import { buildingLandmarkSchema } from "#src/models/world/BuildingLandmark";
import { statueLandmarkSchema } from "#src/models/world/StatueLandmark";
import { treeLandmarkSchema } from "#src/models/world/TreeLandmark";
import { z } from "zod";

export type Landmark = BuildingLandmark | StatueLandmark | TreeLandmark;

export const landmarkSchema = z.discriminatedUnion("kind", [
  buildingLandmarkSchema,
  statueLandmarkSchema,
  treeLandmarkSchema,
]) satisfies z.ZodType<Landmark>;
