import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readWorkspacePackages } from "#src/services/shared/readWorkspacePackages";
import { readEntryExportNames } from "#src/services/workspace/readEntryExportNames";
import { readKeyExportNames } from "#src/services/workspace/readKeyExportNames";
import { TREE_READ_TIMEOUT_MS } from "#src/workspace/constants.test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("readmeKeyExports", () => {
  const SCRIPT_PATH_REGEX = /\.[cm]?[jt]s$/u;

  // A README's Key Exports table names the exports a reader imports, so each must be an export of the package's entry
  test(
    "every name a Key Exports table lists is exported by its package's entry",
    { timeout: TREE_READ_TIMEOUT_MS },
    () => {
      expect.hasAssertions();

      const unexported = readWorkspacePackages(REPOSITORY_ROOT).flatMap(
        ({ directory, manifest, workspaceDirectory }) => {
          const packagePath = workspaceDirectory ? `${workspaceDirectory}/${directory}` : directory;
          const readmePath = join(REPOSITORY_ROOT, packagePath, "README.md");
          if (!existsSync(readmePath)) return [];

          const names = readKeyExportNames(readFileSync(readmePath, "utf8"));
          if (names.length === 0) return [];

          // A package with subpath entries names some exports under them, so each script source arm's exports count
          const sources = Object.values(manifest.exports ?? {}).flatMap((arm) =>
            typeof arm === "string" || arm.source === undefined || !SCRIPT_PATH_REGEX.test(arm.source)
              ? []
              : [arm.source],
          );
          const sourceDirectory = join(REPOSITORY_ROOT, packagePath, "src");
          const exported = new Set(
            sources.flatMap((source) => [
              ...readEntryExportNames(join(REPOSITORY_ROOT, packagePath, source), sourceDirectory),
            ]),
          );
          return names.filter((name) => !exported.has(name)).map((name) => `${manifest.name} -> ${name}`);
        },
      );

      expect(unexported).toStrictEqual([]);
    },
  );
});
