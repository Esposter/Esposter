import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { SnapshotChannel } from "#shared/models/resource/SnapshotChannel";
import { z } from "zod";

export const restoreSnapshotVersionInputSchema = z.object({
  ...resourceIdInputSchema.shape,
  // Which address space the version belongs to: the two channels number independently, so a version alone
  // Names two different snapshots and the caller has to say which of them it means
  channel: z.enum(SnapshotChannel),
  version: z.int().positive(),
});
export type RestoreSnapshotVersionInput = z.infer<typeof restoreSnapshotVersionInputSchema>;
