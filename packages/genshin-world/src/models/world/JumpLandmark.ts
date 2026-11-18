import type { DomainEntranceLandmark } from "#src/models/world/DomainEntranceLandmark";
import type { StatueLandmark } from "#src/models/world/StatueLandmark";
import type { StatueOfTheNewMoonLandmark } from "#src/models/world/StatueOfTheNewMoonLandmark";
import type { WaypointLandmark } from "#src/models/world/WaypointLandmark";

import { domainEntranceLandmarkSchema } from "#src/models/world/DomainEntranceLandmark";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { statueLandmarkSchema } from "#src/models/world/StatueLandmark";
import { statueOfTheNewMoonLandmarkSchema } from "#src/models/world/StatueOfTheNewMoonLandmark";
import { waypointLandmarkSchema } from "#src/models/world/WaypointLandmark";
import { z } from "zod";

// The landmarks a jump lands at, as the game teleports to its waypoints, statues and unlocked domain entrances and
// Nowhere else. A Statue of the New Moon is one of the statues, a waypoint in exploring once it is discovered
export const JUMP_LANDMARK_KINDS: readonly LandmarkKind[] = [
  LandmarkKind.DomainEntrance,
  LandmarkKind.StatueOfTheNewMoon,
  LandmarkKind.StatueOfTheSeven,
  LandmarkKind.TeleportWaypoint,
];

// Whether a landmark of this kind is one a jump lands at
export const checkIsJumpKind = (kind: string): kind is LandmarkKind =>
  JUMP_LANDMARK_KINDS.some((jumpKind) => jumpKind === kind);

export type JumpLandmark = DomainEntranceLandmark | StatueLandmark | StatueOfTheNewMoonLandmark | WaypointLandmark;

export const jumpLandmarkSchema = z.discriminatedUnion("kind", [
  domainEntranceLandmarkSchema,
  statueLandmarkSchema,
  statueOfTheNewMoonLandmarkSchema,
  waypointLandmarkSchema,
]) satisfies z.ZodType<JumpLandmark>;

// A region's landmarks file, which sits beside its data file and holds the region's jump landmarks exactly as the data
// File holds them. The world's start reads these, so it reads no region's whole data file
export const REGION_LANDMARKS_SUFFIX = ".landmarks.json";
export const regionLandmarksSchema = z.object({ landmarks: z.array(jumpLandmarkSchema) });
export type RegionLandmarks = z.infer<typeof regionLandmarksSchema>;
