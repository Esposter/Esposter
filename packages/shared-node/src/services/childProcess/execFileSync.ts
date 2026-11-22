import { withHiddenWindowFunction } from "#src/services/childProcess/withHiddenWindowFunction";
import { execFileSync as execFileSyncNode } from "node:child_process";

// Typed as node's own function, so every overload still holds: the wrapper only adds an option.
export const execFileSync: typeof execFileSyncNode = withHiddenWindowFunction(execFileSyncNode);
