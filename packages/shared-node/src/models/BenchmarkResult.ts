import { z } from "zod";
// One bench() entry's timing, as emitted by `vitest bench --outputJson`. Only the fields rendered in
// The markdown view are declared; z.object strips the volatile extras Vitest also writes (min, max,
// Median, rank, …) so the schema survives its experimental-format churn. `rme` is the relative margin
// Of error (±%, the standard benchmark.js confidence figure); `mean` doubles as the per-group baseline
// The formatter divides to derive each task's `vs base` multiplier.
export interface BenchmarkResult {
  hz: number;
  mean: number;
  name: string;
  p99: number;
  rme: number;
  sampleCount: number;
  sd: number;
}

export const benchmarkResultSchema: z.ZodObject<{
  hz: z.ZodNumber;
  mean: z.ZodNumber;
  name: z.ZodString;
  p99: z.ZodNumber;
  rme: z.ZodNumber;
  sampleCount: z.ZodNumber;
  sd: z.ZodNumber;
}> = z.object({
  hz: z.number(),
  mean: z.number(),
  name: z.string(),
  p99: z.number(),
  rme: z.number(),
  sampleCount: z.number(),
  sd: z.number(),
}) satisfies z.ZodType<BenchmarkResult>;
