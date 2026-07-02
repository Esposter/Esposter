import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { OverlayLayers } from "@/models/exec/OverlayLayers";

import { buildBwrapArgs } from "@/services/exec/bwrap/buildBwrapArgs";
import { resolveCwd } from "@/services/exec/util/resolveCwd";
import { ensureWslSourceMirror } from "@/services/exec/wsl/ensureWslSourceMirror";
import { readWslPath } from "@/services/exec/wsl/readWslPath";
// The overlay layers carry host (Windows) paths to the snapshot cache, so translate every one through
// Wslpath before they reach the Linux bwrap argv — exactly as cwd and bindDirs are translated.
const readWslOverlayLayers = ({ lowerDirs, upperDir, workDir }: OverlayLayers): OverlayLayers => ({
  lowerDirs: lowerDirs?.map((lowerDir) => readWslPath(lowerDir)),
  upperDir: upperDir === undefined ? undefined : readWslPath(upperDir),
  workDir: workDir === undefined ? undefined : readWslPath(workDir),
});

export const createWslBwrapArgs = (
  command: readonly string[] | string,
  cwd: string,
  {
    bindDirs = [],
    isNetworkEnabled = false,
    overlayLayers,
  }: Pick<ExecOptions, "bindDirs" | "isNetworkEnabled" | "overlayLayers"> = {},
): string[] => {
  // Split the overlay's source from its mountpoint. The read-only source lower is the ext4 MIRROR (ensureWslSourceMirror
  // Syncs the tree there so reads hit native ext4, not v9fs), but the sandbox mounts it at — and chdir's into — the
  // Repo's logical /mnt/c path, so `pwd` and every absolute path a tool emits match the native baseline instead of
  // Leaking the mirror's `/home/.../sources/<hash>` path (this is what the working-directory differential pins).
  const mirrorDir = ensureWslSourceMirror(resolveCwd(cwd));
  const logicalDir = readWslPath(resolveCwd(cwd));
  const wslBindDirs = bindDirs.map((bindDir) => readWslPath(bindDir));
  return buildBwrapArgs(
    command,
    logicalDir,
    { bindDirs: wslBindDirs, isNetworkEnabled },
    overlayLayers === undefined ? undefined : readWslOverlayLayers(overlayLayers),
    mirrorDir,
  );
};
