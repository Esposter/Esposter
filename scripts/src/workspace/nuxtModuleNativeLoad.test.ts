import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackageDirectories } from "#src/services/shared/readWorkspacePackageDirectories";
import { spawnSync } from "@esposter/shared-node/child-process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "vitest";

// Nuxt reads a Nuxt module's `module.ts` straight from source, through Node's own type stripping, and falls back to
// Jiti when that fails. Node strips only erasable syntax, so an enum anywhere in a module's native graph is what makes
// Nuxt fall back. A value import is in that graph and a type import is not, so the check loads the real entry rather
// Than scanning for an enum: whatever the entry reaches, Node either loads or refuses.
describe("nuxt module entries load natively", () => {
  // Each entry is its own node process, and under load one takes about a minute against vitest's five-second default
  const LOAD_TIMEOUT_MILLISECONDS = Temporal.Duration.from({ minutes: 2 }).total("milliseconds");

  test("load under plain node from their package directory", { timeout: LOAD_TIMEOUT_MILLISECONDS }, () => {
    expect.hasAssertions();

    const MODULE_ENTRY_PATH = "src/module.ts";
    const modulePackagePaths = readWorkspacePackageDirectories(REPOSITORY_ROOT).filter((packagePath) =>
      existsSync(resolve(REPOSITORY_ROOT, packagePath, MODULE_ENTRY_PATH)),
    );
    const loadFailures = modulePackagePaths.flatMap((packagePath) => {
      const packageDirectory = resolve(REPOSITORY_ROOT, packagePath);
      const moduleEntryUrl = pathToFileURL(resolve(packageDirectory, MODULE_ENTRY_PATH)).href;
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
