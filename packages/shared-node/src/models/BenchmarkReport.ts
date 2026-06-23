import type { BenchmarkFile } from "@/models/BenchmarkFile";

import { benchmarkFileSchema } from "@/models/BenchmarkFile";
import { z } from "zod";
// The root of `vitest bench --outputJson`: every .bench.ts file Vitest ran in the suite.
export interface BenchmarkReport {
  files: BenchmarkFile[];
}

export const benchmarkReportSchema: z.ZodObject<{
  files: z.ZodArray<typeof benchmarkFileSchema>;
}> = z.object({
  files: z.array(benchmarkFileSchema),
}) satisfies z.ZodType<BenchmarkReport>;
