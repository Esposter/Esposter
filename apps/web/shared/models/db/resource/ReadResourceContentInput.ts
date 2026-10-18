import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { jsonPointerSchema } from "#shared/models/db/resource/JsonPointer";
import { createOffsetPaginationParamsSchema } from "#shared/models/pagination/offset/OffsetPaginationParams";
import { z } from "zod";

export const readResourceContentInputSchema = z.object({
  ...resourceIdInputSchema.shape,
  // The page an array at the pointer is answered in, which holds its items in their own order
  ...createOffsetPaginationParamsSchema(z.never()).omit({ sortBy: true }).shape,
  pointer: jsonPointerSchema.default(""),
});
export type ReadResourceContentInput = z.infer<typeof readResourceContentInputSchema>;
