import type { BuildingLandmark } from "#src/models/world/BuildingLandmark";
import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { RockLandmark } from "#src/models/world/RockLandmark";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { TreeLandmark } from "#src/models/world/TreeLandmark";
import type { WaypointLandmark } from "#src/models/world/WaypointLandmark";

import { buildingLandmarkSchema } from "#src/models/world/BuildingLandmark";
import { domainEntranceLandmarkSchema } from "#src/models/world/DomainEntranceLandmark";
import { rockLandmarkSchema } from "#src/models/world/RockLandmark";
import { statueLandmarkSchema } from "#src/models/world/StatueLandmark";
import { treeLandmarkSchema } from "#src/models/world/TreeLandmark";
import { waypointLandmarkSchema } from "#src/models/world/WaypointLandmark";
import { z } from "zod";

export type Landmark =
  | BuildingLandmark
  | DomainEntranceLandmark
  | RockLandmark
  | StatueLandmark
  | TreeLandmark
  | WaypointLandmark;

export const landmarkSchema = z.discriminatedUnion("kind", [
  buildingLandmarkSchema,
  domainEntranceLandmarkSchema,
  rockLandmarkSchema,
  statueLandmarkSchema,
  treeLandmarkSchema,
  waypointLandmarkSchema,
]) satisfies z.ZodType<Landmark>;
