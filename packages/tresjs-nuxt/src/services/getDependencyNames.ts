import type { PackageManifest } from "#src/models/PackageManifest";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const getDependencyNames = async (directory: string): Promise<string[]> => {
  // oxlint-disable-next-line no-restricted-properties -- package manifests contain versions and scripts, never date fields to revive
  const manifest: PackageManifest = JSON.parse(await readFile(join(directory, "package.json"), "utf8"));
  return [...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})];
};
