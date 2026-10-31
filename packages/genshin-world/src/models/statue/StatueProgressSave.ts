import { MAX_FOUND_OCULUS_COUNT, MAX_SAVE_ID_LENGTH, MAX_STATUE_REGION_COUNT } from "#src/services/save/constants";
import { createRecordSchema, createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A region's statues as the save holds them: the Oculi held toward its next level, the level it has reached, and the level
// Its rewards have been claimed through. A region holds the one kind of Oculus its statues take, and a region the player
// Has not started holds only the Oculi it has found, at level zero and with no level claimed
export const statueRegionProgressSaveSchema = z.object({
  claimedLevel: z.int().nonnegative(),
  heldCount: z.int().nonnegative(),
  level: z.int().nonnegative(),
});

export type StatueRegionProgressSave = z.infer<typeof statueRegionProgressSaveSchema>;

// The Statues of The Seven as the save holds them: each region's progress, by the region's id, and the ids of the Oculi
// Found, each unique
export const statueProgressSaveSchema = z.object({
  foundOculusIds: createUniqueArraySchema(z.string().min(1).max(MAX_SAVE_ID_LENGTH)).max(MAX_FOUND_OCULUS_COUNT),
  regions: createRecordSchema(
    z.string().min(1).max(MAX_SAVE_ID_LENGTH),
    statueRegionProgressSaveSchema,
    MAX_STATUE_REGION_COUNT,
  ),
});

export type StatueProgressSave = z.infer<typeof statueProgressSaveSchema>;
