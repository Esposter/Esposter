import { readNuxtModulePackagePaths } from "#src/services/shared/readNuxtModulePackagePaths";
import { spawnNuxtModuleEntryLoad } from "#src/services/shared/spawnNuxtModuleEntryLoad";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

const modulePackagePaths = readNuxtModulePackagePaths();

// One task per Nuxt module entry, each the same node process the native-load test spawns for it through the same helper.
// The test's own assertion on exit status stays in the test; this bench only times the load.
describe("nuxt module entries load natively", () => {
  test("load under plain node from their package directory", async ({ bench }) => {
    await bench.compare(
      ...modulePackagePaths.map((packagePath) => bench(packagePath, () => spawnNuxtModuleEntryLoad(packagePath))),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
