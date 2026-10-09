import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// A platform reader's command, its standard output; a command that fails rejects, which each reader wraps in a Result
export const runMachineCommand = async (file: string, args: string[]): Promise<string> =>
  (await execFileAsync(file, args, { encoding: "utf8", windowsHide: true })).stdout;
