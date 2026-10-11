import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { jsonPatchOperationSchema } from "#shared/models/jsonPatch/JsonPatchOperation";
import { MAX_PATCH_OPERATIONS } from "#shared/services/jsonPatch/constants";
import { selectResourceInResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

export const updateResourceContentInputSchema = z.object({
  ...resourceIdInputSchema.shape,
  // The version the patch was written against; left out, the patch applies to the latest content
  contentVersion: selectResourceInResourceSchema.shape.contentVersion.optional(),
  // In order, and an operation may repeat: two appends of one value are two rows
  operations: z.array(jsonPatchOperationSchema).min(1).max(MAX_PATCH_OPERATIONS),
});
export type UpdateResourceContentInput = z.infer<typeof updateResourceContentInputSchema>;
