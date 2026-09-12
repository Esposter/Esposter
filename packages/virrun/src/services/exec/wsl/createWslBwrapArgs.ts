import type { ExecOptions } from "#src/models/exec/ExecOptions";

import { buildBwrapArgs } from "#src/services/exec/bwrap/buildBwrapArgs";
import { resolveCwd } from "#src/services/exec/util/resolveCwd";
import { getWslSourceMirrorPath } from "#src/services/exec/wsl/getWslSourceMirrorPath";
import { readWslOverlayLayers } from "#src/services/exec/wsl/readWslOverlayLayers";
import { readWslPath } from "#src/services/exec/wsl/readWslPath";

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
