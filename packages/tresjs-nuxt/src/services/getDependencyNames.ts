import type { PackageManifest } from "#src/models/PackageManifest";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const getDependencyNames = async (directory: string): Promise<string[]> => {
  // Package manifests contain versions and scripts, never date fields to revive.
  // oxlint-disable-next-line no-restricted-properties -- a manifest holds no date fields that a revive would need
  const manifest: PackageManifest = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
  return [...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})];
};
