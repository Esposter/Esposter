import { PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { resolveCwd } from "@/services/exec/util/resolveCwd";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { file } from "empathic/find";
import { dirname } from "node:path";
// The workspace root that anchors every repo-local artifact: the nearest ancestor of cwd holding the pnpm
// Lockfile. Resolving it by walking up (rather than assuming cwd already is the root) keeps the dep store, the
// Snapshot cache key, and the .gitignore entry at one place per repo no matter which subdirectory virrun is
// Invoked from — instead of scattering a fresh `.virrun` (and a `.gitignore` edit) into every cwd. A missing
// Lockfile anywhere up the tree is misuse — there is nothing to cache or key against — so it throws, mirroring
// ComputeLockfileHash, rather than silently anchoring to an arbitrary directory.
export const resolveWorkspaceRoot = (cwd: string): string => {
  const lockfile = file(PNPM_LOCKFILE_FILENAME, { cwd: resolveCwd(cwd) });
  if (lockfile === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      resolveWorkspaceRoot.name,
      `no ${PNPM_LOCKFILE_FILENAME} found in ${resolveCwd(cwd)} or any parent`,
    );
  return dirname(lockfile);
};
