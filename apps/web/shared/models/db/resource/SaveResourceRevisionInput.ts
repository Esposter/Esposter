import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { SnapshotReason } from "#shared/models/resource/SnapshotReason";
import { MAX_SNAPSHOT_LABEL_LENGTH } from "#shared/services/resource/constants";
import { createNormalizedStringSchema } from "@esposter/shared";
import { z } from "zod";

// The reasons a client may name, which is not the whole enum: Automatic is decided by the save path from a
// Clock, and BeforeRestore by the restore itself. Both would be a lie coming from a caller
export const saveResourceRevisionInputSchema = z
  .object({
    ...resourceIdInputSchema.shape,
    label: createNormalizedStringSchema(MAX_SNAPSHOT_LABEL_LENGTH).default(""),
    reason: z.enum([SnapshotReason.BeforeImport, SnapshotReason.Manual]).default(SnapshotReason.Manual),
  })
  // A label is what the owner typed when they took a version by hand, so it belongs to that reason alone: a
  // Labelled BeforeImport row reads in the history as a milestone someone chose, when the import took it
  .refine(({ label, reason }) => label === "" || reason === SnapshotReason.Manual, {
    error: `A label is only accepted on a ${SnapshotReason.Manual} revision`,
  });
export type SaveResourceRevisionInput = z.infer<typeof saveResourceRevisionInputSchema>;
