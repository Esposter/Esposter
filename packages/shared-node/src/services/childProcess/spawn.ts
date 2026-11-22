import { withHiddenWindowFunction } from "#src/services/childProcess/withHiddenWindowFunction";
import { spawn as spawnNode } from "node:child_process";

// Typed as node's own function, so every overload still holds: the wrapper only adds an option.
export const spawn: typeof spawnNode = withHiddenWindowFunction(spawnNode);
