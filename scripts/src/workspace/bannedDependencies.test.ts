import type { ModuleReplacement } from "module-replacements";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { microUtilsReplacements, nativeReplacements, preferredReplacements } from "module-replacements";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

interface BannedDependency {
  name: string;
  replacement: ModuleReplacement;
}
interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// A manifest names a banned dependency when its `dependencies` or `devDependencies` lists a package a replacement is
// Recorded for. The ESLint rule this replaces, `depend/ban-dependencies`, took its replacements from the three manifests
// Of `module-replacements` through its defaults: `depend.js` passes no options, so no preset is dropped, no name is
// Allowed and no module is added. Its native-version gate reads `engines.node` of the closest manifest to the lint's
// Working directory, the root, which declares none, so every native match is reported here too
describe("bannedDependencies", () => {
  const DEPENDENCY_KEYS: (keyof PackageManifest)[] = ["dependencies", "devDependencies"];
  const REPLACEMENTS: ModuleReplacement[] = [microUtilsReplacements, nativeReplacements, preferredReplacements].flatMap(
    ({ moduleReplacements }) => moduleReplacements,
  );
  const getBannedDependencies = (manifest: PackageManifest): BannedDependency[] =>
    DEPENDENCY_KEYS.flatMap((key) => Object.keys(manifest[key] ?? {})).flatMap((name) => {
      const replacement = REPLACEMENTS.find(
        ({ moduleName }) => name === moduleName || name.startsWith(`${moduleName}/`),
      );
      return replacement ? [{ name, replacement }] : [];
    });

  test("a manifest names a banned dependency", () => {
    expect.hasAssertions();

    expect(getBannedDependencies({ dependencies: { moment: "^2.30.1" } })).toStrictEqual([
      {
        name: "moment",
        replacement: { category: "preferred", docPath: "moment", moduleName: "moment", type: "documented" },
      },
    ]);
  });

  test("every tracked manifest names no banned dependency", () => {
    expect.hasAssertions();

    const bannedDependencies = readSweepFilePaths("*package.json").flatMap((path) =>
      getBannedDependencies(parseMachineJson<PackageManifest>(readFileSync(join(REPOSITORY_ROOT, path), "utf8"))).map(
        ({ name, replacement }) => `${path} "${name}" is banned, replaced by ${JSON.stringify(replacement)}`,
      ),
    );

    expect(bannedDependencies).toStrictEqual([]);
  });
});
