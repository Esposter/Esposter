import { z } from "zod";

// The whole time each test file took, as `TestTimingsReporter` records it, merged over every coverage shard: each
// Project's files by their path from the root, none for a project that ran only type tests. Only the duration is
// Read, so every other field is stripped
export interface TestTimings {
  projects: Record<string, { files?: Record<string, { duration: number }> }>;
}

export const testTimingsSchema: z.ZodType<TestTimings> = z.object({
  projects: z.record(
    z.string(),
    z.object({ files: z.record(z.string(), z.object({ duration: z.number() })).exactOptional() }),
  ),
});
