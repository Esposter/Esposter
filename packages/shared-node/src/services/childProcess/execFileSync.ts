import type { execFileSync as execFileSyncNodeType } from "node:child_process";

import { withHiddenWindow } from "#src/services/childProcess/withHiddenWindow";
import { execFileSync as execFileSyncNode } from "node:child_process";

// Typed as node's own function, so every overload still holds: the wrapper only adds an option.
export const execFileSync = ((file: string, ...parameters: unknown[]) =>
  (execFileSyncNode as (...nodeParameters: unknown[]) => unknown)(
    file,
    ...withHiddenWindow(parameters),
  )) as typeof execFileSyncNodeType;
