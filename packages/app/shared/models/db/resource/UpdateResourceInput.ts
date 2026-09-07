import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { refineAtLeastOne } from "#shared/services/zod/refineAtLeastOne";
import { selectResourceSchema } from "@esposter/db-schema";
import { z } from "zod";

// Tags replace the whole record rather than merging, which is Azure's own tag update semantics.
// Both editable fields are optional so a caller writes only the field it owns: a rename and a tag edit are
// Independent writes to one row, and a tag edit that had to restate the name would put the pre-rename name
// Back whenever the two overlap
const updatableResourceSchema = selectResourceSchema.pick({ name: true, tags: true });

export const updateResourceInputSchema = refineAtLeastOne(
  z.object({
    ...resourceIdInputSchema.shape,
    ...updatableResourceSchema.partial().shape,
  }),
  updatableResourceSchema.keyof().options,
);
export type UpdateResourceInput = z.infer<typeof updateResourceInputSchema>;
