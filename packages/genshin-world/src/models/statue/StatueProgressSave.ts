import { offeringProgressSaveSchema } from "#src/models/offering/OfferingProgressSave";
import { MAX_FOUND_OCULUS_COUNT, MAX_SAVE_ID_LENGTH, MAX_STATUE_REGION_COUNT } from "#src/services/save/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// The Statues of The Seven as the save holds them: each region's Oculi held toward its next level and the level it has
// Reached, by the region's id, and the ids of the Oculi found, each unique. A region the player has not started holds
// Only the Oculi it has been offered, at level zero
export const statueProgressSaveSchema = z.object({
  foundOculusIds: createUniqueArraySchema(z.string().min(1).max(MAX_SAVE_ID_LENGTH)).max(MAX_FOUND_OCULUS_COUNT),
  regions: z
    .record(z.string().min(1).max(MAX_SAVE_ID_LENGTH), offeringProgressSaveSchema)
    .refine((regionMap) => Object.keys(regionMap).length <= MAX_STATUE_REGION_COUNT, "Too many regions"),
});

export type StatueProgressSave = z.infer<typeof statueProgressSaveSchema>;
