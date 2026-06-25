import { z } from "zod";
// One bench() entry's timing, as emitted by `vitest bench --outputJson`. Only the fields the markdown
// View renders are declared; z.object strips every other stat Vitest writes (hz, sd, min, max, median,
// Rank, …) so the schema survives its experimental-format churn and the JSON record stays in step with
// The table. `rme` is the relative margin of error (±%, the standard benchmark.js confidence figure);
// `mean` doubles as the per-group baseline the formatter divides to derive each task's `vs base`
// Multiplier; `p99` is the tail. `sampleCount` is kept as a clarity/confidence indicator for the
// Baseline even though the fixed-iteration stable runner holds it constant — a bench may still override
// Its iteration count. We drop hz (it is just `1000 / mean`, no new signal) — it does not earn a column.
export interface BenchmarkResult {
  mean: number;
  name: string;
  p99: number;
  rme: number;
  sampleCount: number;
}

export const benchmarkResultSchema: z.ZodObject<{
  mean: z.ZodNumber;
  name: z.ZodString;
  p99: z.ZodNumber;
  rme: z.ZodNumber;
  sampleCount: z.ZodNumber;
}> = z.object({
  mean: z.number(),
  name: z.string(),
  p99: z.number(),
  rme: z.number(),
  sampleCount: z.number(),
}) satisfies z.ZodType<BenchmarkResult>;
