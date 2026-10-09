import type { StagedImporter } from "#src/models/hooks/StagedImporter";

import { findMissingImports } from "#src/services/hooks/stagedImports/findMissingImports";
import { describe, expect, test } from "vitest";

describe(findMissingImports, () => {
  const PACKAGE_DIRECTORY = "packages/genshin-world";
  const ALIASES = { "#src/*": "./src/*.ts" };
  const IMPORTER_PATH = "packages/genshin-world/src/components/Index.vue";
  const TRACKED_PATH = "packages/genshin-world/src/services/tracked.ts";
  const STAGED_PATH = "packages/genshin-world/src/services/staged.ts";
  const MISSING_SPECIFIER = "#src/services/quest/checkIsQuestFinished";
  const COMMITTED_PATHS = new Set([STAGED_PATH, TRACKED_PATH]);

  const createImporter = (specifiers: string[]): StagedImporter => ({
    aliases: ALIASES,
    packageDirectory: PACKAGE_DIRECTORY,
    path: IMPORTER_PATH,
    specifiers,
  });

  test("passes a target tracked in HEAD and a target staged in the commit", () => {
    expect.hasAssertions();

    expect(
      findMissingImports([createImporter(["#src/services/tracked", "#src/services/staged"])], COMMITTED_PATHS),
    ).toStrictEqual([]);
  });

  // A Vite query names how a tracked module is imported, so the module it names is the one checked
  test("passes a tracked target imported with a Vite query", () => {
    expect.hasAssertions();

    expect(findMissingImports([createImporter(["#src/services/tracked?worker"])], COMMITTED_PATHS)).toStrictEqual([]);
  });

  test("fails a target neither in HEAD nor staged, naming the importer, the import and the missing path", () => {
    expect.hasAssertions();

    expect(findMissingImports([createImporter([MISSING_SPECIFIER])], COMMITTED_PATHS)).toStrictEqual([
      {
        importingPath: IMPORTER_PATH,
        missingPath: "packages/genshin-world/src/services/quest/checkIsQuestFinished.ts",
        specifier: MISSING_SPECIFIER,
      },
    ]);
  });
});
