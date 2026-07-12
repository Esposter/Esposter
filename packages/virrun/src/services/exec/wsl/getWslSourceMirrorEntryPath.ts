import { VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { getSourceMirrorKey } from "@/services/exec/wsl/getSourceMirrorKey";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
import { readWslPath } from "@/services/exec/wsl/readWslPath";
// The ext4 mirror entry's Linux path for a host cwd: `<wslNativeCacheRoot>/sources/<sha256(cwd)>` (getSourceMirrorKey),
// Keyed by the absolute host path so distinct repos/worktrees never collide. This is the self-contained entry dir
// (holding the `tree/` sync target + the `origin` marker + the published `manifest.json`), the unit
// ReapAbandonedSourceMirrors reclaims whole; getWslSourceMirrorPath appends `tree/` for the sandbox lower. Pure (no sync).
export const getWslSourceMirrorEntryPath = (cwd: string): string => {
  const cacheRoot = readWslPath(getWslNativeCacheRoot());
  return `${cacheRoot}/${VIRRUN_SOURCES_DIRECTORY_NAME}/${getSourceMirrorKey(cwd)}`;
};
