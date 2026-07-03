import { VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
import { readWslPath } from "@/services/exec/wsl/readWslPath";
import { createHash } from "node:crypto";
// The ext4 mirror entry's Linux path for a host cwd: `<wslNativeCacheRoot>/sources/<sha256(cwd)>`, keyed by the
// Absolute host path so distinct repos/worktrees never collide. This is the self-contained entry dir (holding the
// `tree/` rsync target + the `origin` marker), the unit reapAbandonedSourceMirrors reclaims whole; getWslSourceMirrorPath
// Appends `tree/` for the sandbox lower. Pure (no sync).
export const getWslSourceMirrorEntryPath = (cwd: string): string => {
  const cacheRoot = readWslPath(getWslNativeCacheRoot());
  const key = createHash("sha256").update(cwd).digest("hex");
  return `${cacheRoot}/${VIRRUN_SOURCES_DIRECTORY_NAME}/${key}`;
};
