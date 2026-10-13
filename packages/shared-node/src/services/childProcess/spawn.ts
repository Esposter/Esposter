import type { ChildProcess, spawn as spawnNodeType } from "node:child_process";

import { withHiddenWindow } from "#src/services/childProcess/withHiddenWindow";
import { spawn as spawnNode } from "node:child_process";

// Typed as node's own function, so every overload still holds: the wrapper only adds an option.
export const spawn = ((file: string, ...parameters: unknown[]) =>
  (spawnNode as (...nodeParameters: unknown[]) => ChildProcess)(
    file,
    ...withHiddenWindow(parameters),
  )) as typeof spawnNodeType;
