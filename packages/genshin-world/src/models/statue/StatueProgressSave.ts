import { MAX_FOUND_OCULUS_COUNT, MAX_SAVE_ID_LENGTH, MAX_STATUE_REGION_COUNT } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A region's statues as the save holds them: the Oculi collected and not yet offered, the Oculi offered toward its next
// Level, and the level it has reached. A region the player has not started holds only the Oculi it has collected, at level zero
export const statueRegionProgressSaveSchema = z.object({
  collectedCount: z.int().nonnegative(),
  heldCount: z.int().nonnegative(),
  level: z.int().nonnegative(),
});

export type StatueRegionProgressSave = z.infer<typeof statueRegionProgressSaveSchema>;

// The Statues of The Seven as the save holds them: each region's progress, by the region's id, and the ids of the Oculi
// Found, each unique
export const statueProgressSaveSchema = z.object({
  foundOculusIds: createUniqueArraySchema(z.string().min(1).max(MAX_SAVE_ID_LENGTH)).max(MAX_FOUND_OCULUS_COUNT),
  regions: z
    .record(z.string().min(1).max(MAX_SAVE_ID_LENGTH), statueRegionProgressSaveSchema)
    .refine((regionMap) => Object.keys(regionMap).length <= MAX_STATUE_REGION_COUNT, "Too many regions"),
});

export type StatueProgressSave = z.infer<typeof statueProgressSaveSchema>;
