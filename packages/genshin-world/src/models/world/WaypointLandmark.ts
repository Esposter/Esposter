import type { BaseLandmark } from "#src/models/world/BaseLandmark";
import type { LandmarkArrival } from "#src/models/world/LandmarkArrival";

import { baseLandmarkSchema } from "#src/models/world/BaseLandmark";
import { landmarkArrivalSchema } from "#src/models/world/LandmarkArrival";
import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { z } from "zod";

// A Teleport Waypoint, which exploring jumps to as the game teleports to it, named by the area it stands in
export interface WaypointLandmark extends BaseLandmark {
  arrival: LandmarkArrival;
  kind: LandmarkKind.TeleportWaypoint;
}

export const waypointLandmarkSchema = baseLandmarkSchema.safeExtend({
  arrival: landmarkArrivalSchema,
  kind: z.literal(LandmarkKind.TeleportWaypoint),
}) satisfies z.ZodType<WaypointLandmark>;
