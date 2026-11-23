import { z } from "zod";

// The durations Vitest records after a run (`results.json` in its cache directory), merged over every coverage shard:
// Each project's files by their path from the root. Only the duration is read, so every other field is stripped
export interface TestTimings {
  projects: Record<string, { files?: Record<string, { duration: number }> | undefined }>;
}

export const testTimingsSchema = z.object({
  projects: z.record(
    z.string(),
    z.object({ files: z.record(z.string(), z.object({ duration: z.number() })).optional() }),
  ),
}) satisfies z.ZodType<TestTimings>;
