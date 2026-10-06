import type { NpmLockfile } from "#src/models/outdatedDependencies/npm/NpmLockfile";
import type { NpmProject } from "#src/models/outdatedDependencies/npm/NpmProject";
import type { PackageManifest } from "@esposter/configuration";

import { getNpmEntries } from "#src/services/outdatedDependencies/npm/getNpmEntries";
import { getNpmLockResolvedVersions } from "#src/services/outdatedDependencies/npm/getNpmLockResolvedVersions";
import { PACKAGE_JSON_FILENAME } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Found by the lockfile, whose paths the caller lists, rather than by the workspace list, because one of them is not
// A member: the plugin's runtime manifest sits under the plugin, where no workspace glob reaches, and is installed
// Only by its `voice` verb. The manifest name is what the report attributes the entries to, since these declare their own ranges
// Rather than pointing at a workspace section.
export const readNpmProjects = (root: string, lockfilePaths: string[]): NpmProject[] =>
  lockfilePaths.map((lockfilePath) => {
    const manifestPath = resolve(root, dirname(lockfilePath), PACKAGE_JSON_FILENAME);
    const manifest = parseMachineJson<PackageManifest>(readFileSync(manifestPath, "utf8"));
    const lockfile = parseMachineJson<NpmLockfile>(readFileSync(resolve(root, lockfilePath), "utf8"));
    const manifestName = manifest.name ?? "";

    return {
      entries: getNpmEntries(manifestName, manifest),
      manifestName,
      manifestPath,
      resolvedVersions: getNpmLockResolvedVersions(lockfile),
    };
  });
