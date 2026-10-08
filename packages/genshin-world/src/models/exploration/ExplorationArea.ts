import type { ExplorationDoing } from "#src/models/exploration/ExplorationDoing";

import { explorationDoingSchema } from "#src/models/exploration/ExplorationDoing";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// An area's exploration as the game's table gives it: the catalogue area it is, the total its progress is a share of,
// And the doings its progress counts
export interface ExplorationArea {
  areaId: string;
  doings: ExplorationDoing[];
  total: number;
}

export const explorationAreaSchema = z.object({
  areaId: z.string().min(1),
  doings: createUniqueArraySchema(explorationDoingSchema, "id").min(1),
  total: z.int().positive(),
}) satisfies z.ZodType<ExplorationArea>;
