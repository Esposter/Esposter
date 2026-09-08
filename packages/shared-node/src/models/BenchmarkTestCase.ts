// The minimal structural slice of a Vitest reported test that buildBenchmarkFileReport reads. Declared as
// Our own contract rather than importing Vitest's experimental bench result types — a real `TestCase` is
// Structurally assignable to it, which is also what keeps the projection unit-testable without a live run.
// `benchmarks()` is empty for an ordinary test, so a file of plain tests projects to no groups at all.
export interface BenchmarkTestCase {
  benchmarks: () => readonly BenchmarkTestCaseBenchmark[];
  fullName: string;
}
// One `bench.compare(...)` (or a lone `bench().run()`) inside a test: its tasks, plus the name the comparison
// Was registered under, which only reaches a group title where a test ran more than one.
export interface BenchmarkTestCaseBenchmark {
  name: string;
  tasks: readonly BenchmarkTestCaseTask[];
}
// One `bench()` entry's measured latency. Vitest reports throughput alongside it, and the whole of tinybench's
// Statistics set under `latency`; only the fields the markdown table renders are named. `rank` is 1 for the
// Fastest task — the order Vitest reports and the report writes, so a row's position never depends on where a
// Registration happened to sit in the file.
export interface BenchmarkTestCaseTask {
  latency: { mean: number; p99: number; rme: number; samplesCount: number };
  name: string;
  rank: number;
}
