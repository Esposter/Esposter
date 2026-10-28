import type { ChildProcess, execFile as execFileNodeType } from "node:child_process";

import { withHiddenWindow } from "#src/services/childProcess/withHiddenWindow";
import { execFile as execFileNode } from "node:child_process";
import { promisify } from "node:util";

// Typed as node's own function, so every overload still holds: the wrapper only adds an option.
export const execFile = ((file: string, ...parameters: unknown[]) =>
  (execFileNode as (...nodeParameters: unknown[]) => ChildProcess)(
    file,
    ...withHiddenWindow(parameters),
  )) as typeof execFileNodeType;
// Node's own promisified form resolves `{ stdout, stderr }` through `promisify.custom`, which a plain wrapper would
// Lose, leaving `promisify(execFile)` resolving stdout alone; the wrapper carries it over, the window hidden there too
Object.defineProperty(execFile, promisify.custom, {
  value: (file: string, ...parameters: unknown[]) => {
    const promisifiedNode: (...promisedParameters: unknown[]) => Promise<unknown> = promisify(
      execFileNode as (...nodeParameters: unknown[]) => void,
    );
    return promisifiedNode(file, ...withHiddenWindow(parameters));
  },
});
// oxlint-disable-next-line typescript/strict-void-return -- promisify reads execFile's callback overload, whose void return the rule mistakes for this call's context
export const execFileAsync: typeof execFileNodeType.__promisify__ = promisify(execFile);
