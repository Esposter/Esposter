import type { BuildingLandmark } from "#src/models/world/BuildingLandmark";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { TreeLandmark } from "#src/models/world/TreeLandmark";

import { buildingLandmarkSchema } from "#src/models/world/BuildingLandmark";
import { domainEntranceLandmarkSchema } from "#src/models/world/DomainEntranceLandmark";
import { statueLandmarkSchema } from "#src/models/world/StatueLandmark";
import { treeLandmarkSchema } from "#src/models/world/TreeLandmark";
import { z } from "zod";

export type Landmark = BuildingLandmark | DomainEntranceLandmark | StatueLandmark | TreeLandmark;

export const landmarkSchema = z.discriminatedUnion("kind", [
  buildingLandmarkSchema,
  domainEntranceLandmarkSchema,
  statueLandmarkSchema,
  treeLandmarkSchema,
]) satisfies z.ZodType<Landmark>;
