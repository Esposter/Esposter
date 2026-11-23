/* oxlint-disable typescript/strict-void-return -- promisify reads execFile's callback overload, whose void return
   the rule mistakes for this call's context */
import { withHiddenWindowFunction } from "#src/services/childProcess/withHiddenWindowFunction";
import { execFile as execFileNode } from "node:child_process";
import { promisify } from "node:util";

// Typed as node's own function, so every overload still holds: the wrapper only adds an option.
export const execFile: typeof execFileNode = withHiddenWindowFunction(execFileNode);
// Node's own promisified form resolves `{ stdout, stderr }` through `promisify.custom`, which a plain wrapper would
// Lose, leaving `promisify(execFile)` resolving stdout alone; the wrapper carries it over, the window hidden there too
const promisifiedNode = promisify(execFileNode);
Object.defineProperty(execFile, promisify.custom, { value: withHiddenWindowFunction(promisifiedNode) });
export const execFileAsync: typeof execFileNode.__promisify__ = promisify(execFile);
