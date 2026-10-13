import type { execSync as execSyncNodeType } from "node:child_process";

import { withHiddenWindow } from "#src/services/childProcess/withHiddenWindow";
import { execSync as execSyncNode } from "node:child_process";

// Typed as node's own function, so every overload still holds: the wrapper only adds an option.
export const execSync = ((command: string, ...parameters: unknown[]) =>
  (execSyncNode as (...nodeParameters: unknown[]) => unknown)(
    command,
    ...withHiddenWindow(parameters),
  )) as typeof execSyncNodeType;
