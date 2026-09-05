import type { BenchmarkFile } from "#src/models/BenchmarkFile";
// The root of what the formatter renders. One report is built per bench file, so `files` carries exactly
// One entry — which is what scopes the artifacts to the bench file they came from.
export interface BenchmarkReport {
  files: BenchmarkFile[];
}
