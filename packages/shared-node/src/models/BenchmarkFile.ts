import type { BenchmarkGroup } from "#src/models/BenchmarkGroup";
// One .bench.ts file's results: its path plus every describe() group it ran.
export interface BenchmarkFile {
  filepath: string;
  groups: BenchmarkGroup[];
}
