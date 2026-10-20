import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { NUXT_MODULE_ENTRY_PATH, readNuxtModulePackagePaths } from "#src/services/shared/readNuxtModulePackagePaths";
import { spawnSync } from "@esposter/shared-node/child-process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "vitest";

// Nuxt reads a Nuxt module's `module.ts` straight from source, through Node's own type stripping, and falls back to
// Jiti when that fails. Node strips only erasable syntax, so an enum anywhere in a module's native graph is what makes
// Nuxt fall back. A value import is in that graph and a type import is not, so the check loads the real entry rather
// Than scanning for an enum: whatever the entry reaches, Node either loads or refuses.
describe("nuxt module entries load natively", () => {
  // Each entry is a node process of its own, and the parallel workspace run starts them beside every sibling's read.
  // The test loads every entry in turn, so the limit covers all of them together: the committed bench's p99 for the
  // whole set, with headroom for that contention.
  const LOAD_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");

  test("load under plain node from their package directory", { timeout: LOAD_TIMEOUT_MS }, () => {
    expect.hasAssertions();

    const modulePackagePaths = readNuxtModulePackagePaths();
    const loadFailures = modulePackagePaths.flatMap((packagePath) => {
      const packageDirectory = resolve(REPOSITORY_ROOT, packagePath);
      const moduleEntryUrl = pathToFileURL(resolve(packageDirectory, NUXT_MODULE_ENTRY_PATH)).href;
      const result = spawnSync(
        process.execPath,
        ["--input-type=module", "-e", `await import(${JSON.stringify(moduleEntryUrl)})`],
        { cwd: packageDirectory, encoding: "utf8" },
      );

      return result.status === 0 ? [] : [{ packagePath, stderr: result.stderr }];
    });

    expect(modulePackagePaths).not.toStrictEqual([]);
    expect(loadFailures).toStrictEqual([]);
  });
});
