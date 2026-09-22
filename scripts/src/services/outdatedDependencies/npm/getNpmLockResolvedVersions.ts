import type { NpmLockfile } from "#src/models/outdatedDependencies/npm/NpmLockfile";

import { NPM_LOCKFILE } from "#src/services/shared/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

const NODE_MODULES_PREFIX = "node_modules/";

// The top-level entries alone — one segment under `node_modules`, hoisted transitives included, since only the
// Manifest's own names are ever looked up; a nested path is a second copy of a package no specifier here names.
export const getNpmLockResolvedVersions = (lockfile: NpmLockfile): Map<string, string> => {
  // Lockfile version 1 keyed a tree under `dependencies` instead, and npm has not written one since v6
  if (!lockfile.packages) throw new InvalidOperationError(Operation.Read, NPM_LOCKFILE, "no packages field");

  const versions = new Map<string, string>();

  for (const [path, { version }] of Object.entries(lockfile.packages)) {
    if (!path.startsWith(NODE_MODULES_PREFIX) || !version) continue;

    const packageName = path.slice(NODE_MODULES_PREFIX.length);
    if (packageName.includes(NODE_MODULES_PREFIX)) continue;

    versions.set(packageName, version);
  }

  return versions;
};
