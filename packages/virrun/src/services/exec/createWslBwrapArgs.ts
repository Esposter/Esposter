import type { ExecOptions } from "@/models/exec/ExecOptions";

import { buildBwrapArgs } from "@/services/exec/buildBwrapArgs";
import { readWslPath } from "@/services/exec/readWslPath";

export const createWslBwrapArgs = (
  command: readonly string[] | string,
  cwd: string,
  { bindDirs = [], isNetworkEnabled = false }: Pick<ExecOptions, "bindDirs" | "isNetworkEnabled"> = {},
): string[] => {
  const dir = cwd === "" ? process.cwd() : cwd;
  const wslDir = readWslPath(dir);
  const wslBindDirs = bindDirs.map((bindDir) => readWslPath(bindDir));
  return buildBwrapArgs(command, wslDir, { bindDirs: wslBindDirs, isNetworkEnabled });
};
