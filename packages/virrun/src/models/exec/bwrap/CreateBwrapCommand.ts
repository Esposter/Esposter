import type { BwrapCommand } from "#src/models/exec/bwrap/BwrapCommand";
import type { ExecOptions } from "#src/models/exec/ExecOptions";

export type CreateBwrapCommand = (bwrapArgs: readonly string[], options: ExecOptions) => BwrapCommand;
