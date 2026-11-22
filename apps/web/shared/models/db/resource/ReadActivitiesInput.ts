import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { createPageInputSchema, SortOrder } from "@esposter/db-schema";
import { z } from "zod";

// A resource's trail newest first. An id is a UUIDv7, so the id orders the trail by creation on its own
export const RESOURCE_ACTIVITY_SORT = { keys: ["id"], order: SortOrder.Desc } as const;

export const readActivitiesInputSchema = z.object({
  ...createPageInputSchema(RESOURCE_ACTIVITY_SORT).shape,
  ...resourceIdInputSchema.shape,
});
