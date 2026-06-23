import type { BenchmarkResult } from "@/models/BenchmarkResult";

import { benchmarkResultSchema } from "@/models/BenchmarkResult";
import { z } from "zod";
// A describe() block's benchmarks, keyed by its fully-qualified name (file path > describe label).
export interface BenchmarkGroup {
  benchmarks: BenchmarkResult[];
  fullName: string;
}

export const benchmarkGroupSchema: z.ZodType<BenchmarkGroup> = z.object({
  benchmarks: z.array(benchmarkResultSchema),
  fullName: z.string(),
});
