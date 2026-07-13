import type { BenchmarkFile } from "@/models/BenchmarkFile";
// The root of `vitest bench --outputJson`: every .bench.ts file Vitest ran in the suite.
export interface BenchmarkReport {
  files: BenchmarkFile[];
}
