import type { TestTimings } from "#src/models/TestTimings";
import type { ModuleDiagnostic, Reporter, TestModule, Vitest } from "vitest/node";

import { TEST_SHARD_TIMINGS_DIRECTORY } from "#src/services/constants";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

// A module's whole time: its environment, its harness, its setup files, its collect (the test file's own imports, which
// Run before any test) and its tests. Vitest's `duration` is the last of these alone, so a file whose cost was its
// Imports was recorded near zero, and the sequencer then piled those files onto one shard
export const getModuleDuration = (
  diagnostic: Pick<
    ModuleDiagnostic,
    "collectDuration" | "duration" | "environmentSetupDuration" | "prepareDuration" | "setupDuration"
  >,
): number =>
  diagnostic.environmentSetupDuration +
  diagnostic.prepareDuration +
  diagnostic.setupDuration +
  diagnostic.collectDuration +
  diagnostic.duration;

// Writes each file's whole time after a run into its shard's own record, which CI merges into the one copy the
// Sequencer reads. It reaches a run as a `--reporter` flag rather than through the config, since a flag replaces the
// Config's reporters. A run with no shard has no record to merge, so it writes nothing
export default class TestTimingsReporter implements Reporter {
  #vitest?: Vitest;

  onInit(vitest: Vitest): void {
    this.#vitest = vitest;
  }

  onTestRunEnd(testModules: readonly TestModule[]): void {
    if (!this.#vitest?.config.shard) return;
    const { root, shard } = this.#vitest.config;
    const timings: TestTimings = { projects: {} };
    for (const testModule of testModules) {
      // A module that never ran has no time to record, and zero would read as a cheap file
      if (!["failed", "passed", "skipped"].includes(testModule.state())) continue;
      const project = (timings.projects[testModule.project.name] ??= {});
      project.files ??= {};
      project.files[relative(root, testModule.moduleId).replaceAll("\\", "/")] = {
        duration: getModuleDuration(testModule.diagnostic()),
      };
    }
    const path = join(root, TEST_SHARD_TIMINGS_DIRECTORY, `${shard.index}.json`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(timings));
  }
}
