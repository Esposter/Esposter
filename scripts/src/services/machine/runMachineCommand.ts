import { COMMAND_MAX_BUFFER_BYTES, COMMAND_TIMEOUT_MILLISECONDS } from "#src/services/machine/constants";
import { execFile } from "@esposter/shared-node/child-process";
import { promisify } from "node:util";

// oxlint-disable-next-line typescript/strict-void-return -- promisify settles through the callback and never reads execFile's ChildProcess return, and a void wrapper would lose the promisify.custom that resolves { stdout } (packages/shared-node/src/services/childProcess/execFile.ts:13-15)
const execFileAsync = promisify(execFile);

// A platform reader's command, its standard output; a command that fails or times out rejects, which each reader wraps
// In a Result
export const runMachineCommand = async (file: string, args: string[]): Promise<string> =>
  (
    await execFileAsync(file, args, {
      encoding: "utf8",
      maxBuffer: COMMAND_MAX_BUFFER_BYTES,
      timeout: COMMAND_TIMEOUT_MILLISECONDS,
    })
  ).stdout;
