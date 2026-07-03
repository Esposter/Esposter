import type { BenchmarkGroup } from "@/models/BenchmarkGroup";

import { benchmarkGroupSchema } from "@/models/BenchmarkGroup";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";
// One .bench.ts file's results: its path plus every describe() group it ran.
export interface BenchmarkFile {
  filepath: string;
  groups: BenchmarkGroup[];
}

export const benchmarkFileSchema: z.ZodObject<{
  filepath: z.ZodString;
  groups: z.ZodArray<typeof benchmarkGroupSchema>;
}> = z.object({
  filepath: z.string(),
  groups: createUniqueArraySchema(benchmarkGroupSchema, "fullName"),
}) satisfies z.ZodType<BenchmarkFile>;
