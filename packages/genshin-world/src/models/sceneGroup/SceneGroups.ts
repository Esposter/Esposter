import type { SceneBuildingPoint } from "#src/models/sceneGroup/SceneBuildingPoint";
import type { SceneGroupMember } from "#src/models/sceneGroup/SceneGroupMember";

import { sceneBuildingPointSchema } from "#src/models/sceneGroup/SceneBuildingPoint";
import { sceneGroupMemberSchema } from "#src/models/sceneGroup/SceneGroupMember";
import { z } from "zod";

// The open world's scene group record: each group's members by its group id, and each building point by its point id. A
// Group may place one NPC at two spots, so its members are a list with no key of their own
export interface SceneGroups {
  buildings: Record<string, SceneBuildingPoint>;
  groups: Record<string, SceneGroupMember[]>;
}

export const sceneGroupsSchema = z.object({
  buildings: z.record(z.string().regex(/^\d+$/u), sceneBuildingPointSchema),
  groups: z.record(z.string().regex(/^\d+$/u), z.array(sceneGroupMemberSchema).min(1)),
}) satisfies z.ZodType<SceneGroups>;
