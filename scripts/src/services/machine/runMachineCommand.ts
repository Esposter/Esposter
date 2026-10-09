import { COMMAND_MAX_BUFFER_BYTES, COMMAND_TIMEOUT_MILLISECONDS } from "#src/services/machine/constants";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// A platform reader's command, its standard output; a command that fails or times out rejects, which each reader wraps
// In a Result
export const runMachineCommand = async (file: string, args: string[]): Promise<string> =>
  (
    await execFileAsync(file, args, {
      encoding: "utf8",
      maxBuffer: COMMAND_MAX_BUFFER_BYTES,
      timeout: COMMAND_TIMEOUT_MILLISECONDS,
      windowsHide: true,
    })
  ).stdout;
