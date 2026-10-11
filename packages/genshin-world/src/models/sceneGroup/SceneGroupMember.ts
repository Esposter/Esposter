import type { SceneGroupMemberKind } from "#src/models/sceneGroup/SceneGroupMemberKind";
import type { SceneGroupPlace } from "#src/models/sceneGroup/SceneGroupPlace";
import type { SceneGroupSource } from "#src/models/sceneGroup/SceneGroupSource";

import { sceneGroupMemberKindSchema } from "#src/models/sceneGroup/SceneGroupMemberKind";
import { sceneGroupPlaceSchema } from "#src/models/sceneGroup/SceneGroupPlace";
import { sceneGroupSourceSchema } from "#src/models/sceneGroup/SceneGroupSource";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// One member of a scene group: its kind, its id in its kind's own table (the NPC's, the gadget's or the trigger's), its
// Config id within the group, its place and the group's suites it is placed in, and the source that named it. A field no
// Current source holds is left out rather than guessed: an NPC's config id within its group and a trigger's region are
// The group script's alone, and only the births name suites
export interface SceneGroupMember {
  configId?: number;
  kind: SceneGroupMemberKind;
  objectId: number;
  place?: SceneGroupPlace;
  source: SceneGroupSource;
  suiteIds?: number[];
}

export const sceneGroupMemberSchema = z.object({
  configId: z.int().positive().optional(),
  kind: sceneGroupMemberKindSchema,
  objectId: z.int().positive(),
  place: sceneGroupPlaceSchema.optional(),
  source: sceneGroupSourceSchema,
  suiteIds: createUniqueArraySchema(z.int().positive()).optional(),
}) satisfies z.ZodType<SceneGroupMember>;
