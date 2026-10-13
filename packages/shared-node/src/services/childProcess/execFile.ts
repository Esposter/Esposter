import type { ChildProcess, execFile as execFileNodeType } from "node:child_process";

import { withHiddenWindow } from "#src/services/childProcess/withHiddenWindow";
import { execFile as execFileNode } from "node:child_process";

// Typed as node's own function, so every overload still holds: the wrapper only adds an option.
export const execFile = ((file: string, ...parameters: unknown[]) =>
  (execFileNode as (...nodeParameters: unknown[]) => ChildProcess)(
    file,
    ...withHiddenWindow(parameters),
  )) as typeof execFileNodeType;
