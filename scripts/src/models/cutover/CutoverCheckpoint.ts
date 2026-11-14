import { z } from "zod";

// One unit's progress, kept as a JSON object in the archive bucket. `preCopyStartedAt` is the instant the first live copy of
// the unit began, which the freeze's delta measures changes from; `completedAt` is set once a full copy finished, so a
// re-run skips that unit; `deltaCompletedAt` records the freeze's delta
export const cutoverCheckpointSchema = z.object({
  completedAt: z.iso.datetime().optional(),
  deltaCompletedAt: z.iso.datetime().optional(),
  digest: z.string().optional(),
  preCopyStartedAt: z.iso.datetime().optional(),
});
export type CutoverCheckpoint = z.infer<typeof cutoverCheckpointSchema>;
