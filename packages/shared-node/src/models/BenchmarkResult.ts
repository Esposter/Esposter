import { z } from "zod";
// One bench() entry's timing, as emitted by `vitest bench --outputJson`. Only the fields rendered in
// The markdown view are declared; z.object strips the volatile extras Vitest also writes (min, max,
// Median, rme, rank, …) so the schema survives its experimental-format churn.
export interface BenchmarkResult {
  hz: number;
  mean: number;
  name: string;
  p99: number;
  sampleCount: number;
  sd: number;
}

export const benchmarkResultSchema: z.ZodObject<{
  hz: z.ZodNumber;
  mean: z.ZodNumber;
  name: z.ZodString;
  p99: z.ZodNumber;
  sampleCount: z.ZodNumber;
  sd: z.ZodNumber;
}> = z.object({
  hz: z.number(),
  mean: z.number(),
  name: z.string(),
  p99: z.number(),
  sampleCount: z.number(),
  sd: z.number(),
}) satisfies z.ZodType<BenchmarkResult>;
