import type { InstalledManifest } from "#src/models/dependencies/score/InstalledManifest";

import { PackageFormat } from "#src/models/dependencies/score/PackageFormat";
import { getPackageFormat } from "#src/services/dependencies/score/getPackageFormat";
import { describe, expect, test } from "vitest";

describe(getPackageFormat, () => {
  test.each<[string, InstalledManifest, PackageFormat]>([
    ["a CommonJS main", { main: "index.js" }, PackageFormat.Commonjs],
    ["a module type", { main: "index.js", type: "module" }, PackageFormat.Esm],
    ["an import-only exports map", { exports: { ".": { import: "./index.js" } } }, PackageFormat.Esm],
    [
      "an import and require exports map",
      { exports: { ".": { import: "./index.js", require: "./index.cjs" } } },
      PackageFormat.Dual,
    ],
    [
      "an import and require exports map under a module type",
      { exports: { ".": { import: "./index.js", require: "./index.cjs" } }, type: "module" },
      PackageFormat.Dual,
    ],
    ["a require-only exports map", { exports: { ".": { require: "./index.cjs" } } }, PackageFormat.Commonjs],
    ["a declarations-only scope", { name: "@types/alpha", types: "index.d.ts" }, PackageFormat.Types],
    ["a declarations-only entry", { types: "index.d.ts" }, PackageFormat.Types],
  ])("%s is %s", (_title, manifest, format) => {
    expect.hasAssertions();

    expect(getPackageFormat(manifest)).toBe(format);
  });
});
