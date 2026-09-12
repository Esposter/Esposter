import type { ExecOptions } from "#src/models/exec/ExecOptions";
import type { OverlayLayers } from "#src/models/exec/OverlayLayers";

import { buildBwrapArgs } from "#src/services/exec/bwrap/buildBwrapArgs";
import { resolveCwd } from "#src/services/exec/util/resolveCwd";
import { getWslSourceMirrorPath } from "#src/services/exec/wsl/getWslSourceMirrorPath";
import { readWslPath } from "#src/services/exec/wsl/readWslPath";
// The overlay layers carry host (Windows) paths to the snapshot cache, so translate every one through
// Wslpath before they reach the Linux bwrap argv — exactly as cwd and bindDirectories are translated.
const readWslOverlayLayers = ({ lowerDirectories, upperDirectory, workDirectory }: OverlayLayers): OverlayLayers => ({
  lowerDirectories: lowerDirectories?.map((lowerDirectory) => readWslPath(lowerDirectory)),
  upperDirectory: upperDirectory === undefined ? undefined : readWslPath(upperDirectory),
  workDirectory: workDirectory === undefined ? undefined : readWslPath(workDirectory),
});

export const createWslBwrapArgs = (
  command: readonly string[] | string,
  cwd: string,
  {
    bindDirectories = [],
    isNetworkEnabled = false,
    overlayLayers,
  }: Pick<ExecOptions, "bindDirectories" | "isNetworkEnabled" | "overlayLayers"> = {},
): string[] => {
  // Split the overlay's source from its mountpoint. The read-only source lower is the ext4 MIRROR (the sync script
  // `createWslOsBackend` folds ahead of bwrap brings it up to date, so reads hit native ext4, not v9fs), but the sandbox
  // Mounts it at — and chdir's into — the repo's logical /mnt/c path, so `pwd` and every absolute path a tool emits
  // Match the native baseline instead of leaking the mirror's `/home/.../sources/<hash>` path (this is what the
  // Working-directory differential pins). Pure — the path is deterministic and the mirror content is the folded
  // Script's job, so building args stays spawn-free.
  const mirrorDirectory = getWslSourceMirrorPath(resolveCwd(cwd));
  const logicalDirectory = readWslPath(resolveCwd(cwd));
  const wslBindDirectories = bindDirectories.map((bindDirectory) => readWslPath(bindDirectory));
  return buildBwrapArgs(
    command,
    logicalDirectory,
    { bindDirectories: wslBindDirectories, isNetworkEnabled },
    overlayLayers ? readWslOverlayLayers(overlayLayers) : undefined,
    mirrorDirectory,
  );
};
