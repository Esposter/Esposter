import { withHiddenWindowFunction } from "#src/services/childProcess/withHiddenWindowFunction";
import { execSync as execSyncNode } from "node:child_process";

// Typed as node's own function, so every overload still holds: the wrapper only adds an option.
export const execSync: typeof execSyncNode = withHiddenWindowFunction(execSyncNode);
