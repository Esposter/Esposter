import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { OverlayLayers } from "@/models/exec/OverlayLayers";

import { buildBwrapArgs } from "@/services/exec/bwrap/buildBwrapArgs";
import { resolveCwd } from "@/services/exec/util/resolveCwd";
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
  const wslDir = readWslPath(resolveCwd(cwd));
  const wslBindDirs = bindDirs.map((bindDir) => readWslPath(bindDir));
  return buildBwrapArgs(
    command,
    wslDir,
    { bindDirs: wslBindDirs, isNetworkEnabled },
    overlayLayers === undefined ? undefined : readWslOverlayLayers(overlayLayers),
  );
};
