import type { BenchmarkResult } from "@/models/BenchmarkResult";
// The minimal structural slice of a Vitest runner task that buildBenchmarkFileReport reads. Declared as
// Our own contract rather than importing Vitest's experimental (churn-prone) bench task types — a real
// `File`/`Task` is structurally assignable to it. `meta.benchmark` flags a bench task, `result.benchmark`
// Carries its stats, and `name`/`suite`/`tasks` rebuild the group tree and full names; `filepath` (present
// Only on the file node) is where the colocated artifacts are written.
export interface BenchmarkTaskNode {
  filepath?: string;
  meta: { benchmark?: boolean };
  name: string;
  result?: { benchmark?: BenchmarkResult };
  suite?: BenchmarkTaskNode;
  tasks?: BenchmarkTaskNode[];
  type: string;
}
