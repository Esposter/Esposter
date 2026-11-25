import type { ModuleReplacementMapping } from "module-replacements";

import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { all } from "module-replacements";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

interface BannedDependency {
  mapping: ModuleReplacementMapping;
  name: string;
}
interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// A manifest names a banned dependency when its `dependencies` or `devDependencies` lists a package.
// That includes a subpath of one, which `module-replacements` maps to a replacement in any of its manifests.
// `all` joins the module-replacements manifests: native, micro-utilities and preferred.
describe("bannedDependencies", () => {
  const DEPENDENCY_KEYS: (keyof PackageManifest)[] = ["dependencies", "devDependencies"];
  // A mapping kept on purpose: the ids are UUID v7, time-ordered so a table sorts by creation, and
  // `crypto.randomUUID`, the replacement recorded for `uuid`, makes v4 only
  const ALLOWED_MODULE_NAMES = new Set(["uuid"]);
  const MAPPINGS = Object.values(all.mappings).filter(({ moduleName }) => !ALLOWED_MODULE_NAMES.has(moduleName));
  const getBannedDependencies = (manifest: PackageManifest): BannedDependency[] =>
    DEPENDENCY_KEYS.flatMap((key) => Object.keys(manifest[key] ?? {})).flatMap((name) => {
      const mapping = MAPPINGS.find(({ moduleName }) => name === moduleName || name.startsWith(`${moduleName}/`));
      return mapping ? [{ mapping, name }] : [];
    });

  test("a manifest names a banned dependency", () => {
    expect.hasAssertions();

    expect(getBannedDependencies({ dependencies: { moment: "^2.30.1" } })).toStrictEqual([
      {
        mapping: {
          moduleName: "moment",
          replacements: ["day.js", "date-fns", "luxon", "Date", "Temporal"],
          type: "module",
          url: { id: "moment", type: "e18e" },
        },
        name: "moment",
      },
    ]);
  });

  test("every tracked manifest names no banned dependency", () => {
    expect.hasAssertions();

    const bannedDependencies = readSweepFilePaths("*package.json").flatMap((path) =>
      getBannedDependencies(parseMachineJson<PackageManifest>(readFileSync(join(REPOSITORY_ROOT, path), "utf8"))).map(
        ({ mapping, name }) => `${path} "${name}" is banned, replaced by ${mapping.replacements.join(", ")}`,
      ),
    );

    expect(bannedDependencies).toStrictEqual([]);
  });
});
