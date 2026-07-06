import { PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { findUpFile } from "@/services/exec/util/findUpFile";
import { resolveCwd } from "@/services/exec/util/resolveCwd";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { dirname } from "node:path";
// The workspace root that anchors every repo-local artifact: the nearest ancestor of cwd holding the pnpm
// Lockfile, so virrun invoked from any subdirectory reuses the one repo cache. A missing lockfile up the whole
// Tree is misuse (nothing to cache or key against), so it throws rather than anchoring to an arbitrary directory.
export const resolveWorkspaceRoot = (cwd: string): string => {
  const lockfile = findUpFile(PNPM_LOCKFILE_FILENAME, resolveCwd(cwd));
  if (lockfile === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      resolveWorkspaceRoot.name,
      `no ${PNPM_LOCKFILE_FILENAME} found in ${resolveCwd(cwd)} or any parent`,
    );
  return dirname(lockfile);
};
