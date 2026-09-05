// One bench() entry's timing, narrowed to the fields the markdown view renders. Every other stat Vitest
// Writes (hz, sd, min, max, median, rank, …) is left behind, so this record survives the experimental
// Format's churn and stays in step with the table. `rme` is the relative margin of error, the standard
// ±% confidence figure; `mean` doubles as the per-group baseline the formatter divides to derive each
// Task's `vs base` multiplier; `p99` is the tail. `sampleCount` stays a confidence indicator for the
// Baseline even though the fixed-iteration stable runner holds it constant, since a bench may still
// Override its own iteration count.
export interface BenchmarkResult {
  mean: number;
  name: string;
  p99: number;
  rme: number;
  sampleCount: number;
}
