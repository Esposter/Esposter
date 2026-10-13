import type { spawnSync as spawnSyncNodeType, SpawnSyncReturns } from "node:child_process";

import { withHiddenWindow } from "#src/services/childProcess/withHiddenWindow";
import { spawnSync as spawnSyncNode } from "node:child_process";

// Typed as node's own function, so every overload still holds: the wrapper only adds an option.
export const spawnSync = ((file: string, ...parameters: unknown[]) =>
  (spawnSyncNode as (...nodeParameters: unknown[]) => SpawnSyncReturns<unknown>)(
    file,
    ...withHiddenWindow(parameters),
  )) as typeof spawnSyncNodeType;
