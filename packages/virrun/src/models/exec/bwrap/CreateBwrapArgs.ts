import type { ExecOptions } from "#src/models/exec/ExecOptions";

export type CreateBwrapArgs = (
  command: readonly string[] | string,
  cwd: string,
  options: Pick<ExecOptions, "bindDirectories" | "isNetworkEnabled" | "overlayLayers">,
) => string[];
