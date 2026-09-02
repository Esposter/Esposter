import type { Manifest } from "#scripts/outdatedDependencies/models/Manifest";
import type { PackageManifest } from "@esposter/configuration";

import { getPackageJsonPaths } from "#scripts/services/getPackageJsonPaths";
import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";

// Every manifest in the repo, read once. Two checks walk the same files — the `engines` entries and the
// Dependency specifiers — and reading them apart both doubled the io and made each caller re-model a shape
// `PackageManifest` already carries.
export const getManifests = (root: string): Manifest[] =>
  getPackageJsonPaths(root).map((path) => ({
    manifest: jsonDateParse<PackageManifest>(readFileSync(path, "utf8")),
    path,
  }));
