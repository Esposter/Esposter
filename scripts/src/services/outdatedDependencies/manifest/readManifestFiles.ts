import type { ManifestFile } from "#src/models/outdatedDependencies/manifest/ManifestFile";
import type { PackageManifest } from "@esposter/configuration";

import { getPackageJsonPaths } from "#src/services/shared/getPackageJsonPaths";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";

// Every manifest in the repo, read once. Two checks walk the same files — the `engines` entries and the
// Dependency specifiers — and reading them apart both doubled the io and made each caller re-model a shape
// `PackageManifest` already carries.
export const readManifestFiles = (root: string): ManifestFile[] =>
  getPackageJsonPaths(root).map((path) => ({
    manifest: parseMachineJson<PackageManifest>(readFileSync(path, "utf8")),
    path,
  }));
