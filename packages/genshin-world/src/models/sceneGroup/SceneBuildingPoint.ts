import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";

import { sceneGroupPlaceSchema } from "#src/models/sceneGroup/SceneGroupPlace";
import { z } from "zod";

// A building the scene marks with a point of its own rather than a group's member: the service it marks, as the scene
// Names it ("Restaurant", "Alchemy", "Blacksmith"), and its place
export interface SceneBuildingPoint {
  name: string;
  place: SceneGroupPlace;
}

export const sceneBuildingPointSchema = z.object({
  name: z.string().min(1),
  place: sceneGroupPlaceSchema,
}) satisfies z.ZodType<SceneBuildingPoint>;
