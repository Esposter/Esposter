import type { NpmLockfile } from "#src/models/outdatedDependencies/NpmLockfile";
import type { NpmProject } from "#src/models/outdatedDependencies/NpmProject";
import type { PackageManifest } from "@esposter/configuration";

import { getNpmEntries } from "#src/services/outdatedDependencies/npm/getNpmEntries";
import { getNpmLockResolvedVersions } from "#src/services/outdatedDependencies/npm/getNpmLockResolvedVersions";
import { NPM_LOCKFILE } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

// Found by the lockfile rather than by the workspace list, because one of them is not a member: the plugin's
// Runtime manifest sits under the plugin, where no workspace glob reaches, and is installed only by its `voice`
// Verb. The manifest name is what the report attributes the entries to, since these declare their own ranges
// Rather than pointing at a workspace section.
export const readNpmProjects = (root: string): NpmProject[] =>
  getSweepFilePaths(`*${NPM_LOCKFILE}`).map((lockfilePath) => {
    const manifestPath = resolve(root, dirname(lockfilePath), "package.json");
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
