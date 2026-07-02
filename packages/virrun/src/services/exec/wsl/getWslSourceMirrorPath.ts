import { VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
import { readWslPath } from "@/services/exec/wsl/readWslPath";
import { createHash } from "node:crypto";
// The ext4 mirror's Linux path for a host cwd: `<wslNativeCacheRoot>/sources/<sha256(cwd)>`, keyed by the absolute
// Host path so distinct repos/worktrees never collide. Pure (no sync) — ensureWslSourceMirror calls this then rsyncs
// Into it, while createOsExecOptions calls it to prepend the mirror's node_modules/.bin to the sandbox PATH so a bare
// Command resolves the overlaid (correct-platform) binary before the /mnt/c host bin that WSL interop leaks onto PATH.
export const getWslSourceMirrorPath = (cwd: string): string => {
  const cacheRoot = readWslPath(getWslNativeCacheRoot());
  const key = createHash("sha256").update(cwd).digest("hex");
  return `${cacheRoot}/${VIRRUN_SOURCES_DIRECTORY_NAME}/${key}`;
};
