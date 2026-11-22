import { withHiddenWindowFunction } from "#src/services/childProcess/withHiddenWindowFunction";
import { spawnSync as spawnSyncNode } from "node:child_process";

// Typed as node's own function, so every overload still holds: the wrapper only adds an option.
export const spawnSync: typeof spawnSyncNode = withHiddenWindowFunction(spawnSyncNode);
