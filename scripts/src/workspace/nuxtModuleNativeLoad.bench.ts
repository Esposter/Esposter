import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { NUXT_MODULE_ENTRY_PATH, readNuxtModulePackagePaths } from "#src/services/shared/readNuxtModulePackagePaths";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { spawnSync } from "@esposter/shared-node/child-process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, test } from "vitest";

const modulePackagePaths = readNuxtModulePackagePaths();

// One task per Nuxt module entry, each the same node process the native-load test spawns for it. The test's own
// assertion on exit status stays in the test; this bench only times the load.
describe("nuxt module entries load natively", () => {
  test("load under plain node from their package directory", async ({ bench }) => {
    await bench.compare(
      ...modulePackagePaths.map((packagePath) => {
        const packageDirectory = resolve(REPOSITORY_ROOT, packagePath);
        const moduleEntryUrl = pathToFileURL(resolve(packageDirectory, NUXT_MODULE_ENTRY_PATH)).href;

        return bench(packagePath, () => {
          spawnSync(
            process.execPath,
            ["--input-type=module", "-e", `await import(${JSON.stringify(moduleEntryUrl)})`],
            { cwd: packageDirectory, encoding: "utf8" },
          );
        });
      }),
      BENCHMARK_RUN_OPTIONS,
    );
  });
});
