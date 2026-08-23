import type { BenchmarkResult } from "#src/models/BenchmarkResult";
// A describe() block's benchmarks, keyed by its fully-qualified name (file path > describe label).
export interface BenchmarkGroup {
  benchmarks: BenchmarkResult[];
  fullName: string;
}
