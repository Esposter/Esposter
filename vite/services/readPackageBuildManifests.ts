import type { PackageManifest } from "#vite/models/PackageManifest";

import { PACKAGES_DIRECTORY, ROOT_URL } from "#vite/services/constants";
import { readManifest } from "#vite/services/readManifest";
import { readdirSync } from "node:fs";

export const readPackageBuildManifests = (): { directory: string; manifest: PackageManifest }[] =>
  readdirSync(new URL(`${PACKAGES_DIRECTORY}/`, ROOT_URL)).flatMap((directory) => {
    const manifest = readManifest(`${PACKAGES_DIRECTORY}/${directory}`);
    return manifest?.scripts?.build ? [{ directory, manifest }] : [];
  });
