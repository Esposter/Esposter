import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { z } from "zod";

export const readPublishedVersionContentInputSchema = z.object({
  ...resourceIdInputSchema.shape,
  version: z.int().positive(),
});
export type ReadPublishedVersionContentInput = z.infer<typeof readPublishedVersionContentInputSchema>;
