import type { SceneGroupSource } from "#src/models/sceneGroup/SceneGroupSource";
import type { GroundPoint } from "genshin-engine";

import { sceneGroupSourceSchema } from "#src/models/sceneGroup/SceneGroupSource";
import { groundPointSchema } from "#src/models/world/groundPointSchema";
import { z } from "zod";

// Where a member of a scene group or a building point stands, in the game's own axes: its ground point, its height and
// Its turn about the vertical in degrees where its source gives them (the official map gives neither), and the source
// That placed it
export interface SceneGroupPlace {
  height?: number;
  position: GroundPoint;
  rotationY?: number;
  source: SceneGroupSource;
}

export const sceneGroupPlaceSchema = z.object({
  height: z.number().optional(),
  position: groundPointSchema,
  rotationY: z.number().optional(),
  source: sceneGroupSourceSchema,
}) satisfies z.ZodType<SceneGroupPlace>;
