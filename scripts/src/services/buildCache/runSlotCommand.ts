import { spawnSync } from "node:child_process";
import { totalmem } from "node:os";

const BYTES_PER_MEBIBYTE = 1024 * 1024;
// A run's node heap is capped at a quarter of the machine's RAM, so a run past it fails fast rather than swapping every
// Other run on the machine
const NODE_HEAP_DIVISOR = 4;
const HEAP_OPTION_NAME = "max-old-space-size";

const quoteArgument = (argument: string): string =>
  /[\s"]/u.test(argument) ? `"${argument.replaceAll('"', String.raw`\"`)}"` : argument;

// Runs a command to its end with the same inheritance and limits the shell gate gave one: its stdio, its node heap and,
// On macOS, the utility QoS clamp its children inherit. On Windows the command goes through the shell, which resolves a
// `.cmd` shim such as `pnpm`, and each argument with a space or a quote is quoted for it
export const runSlotCommand = (command: readonly string[], cwd: string = process.cwd()): number | null => {
  const slotCommand = process.platform === "darwin" ? ["taskpolicy", "-c", "utility", ...command] : [...command];
  const environment = { ...process.env };
  if (!environment.NODE_OPTIONS?.includes(HEAP_OPTION_NAME)) {
    const heapMebibytes = Math.floor(totalmem() / NODE_HEAP_DIVISOR / BYTES_PER_MEBIBYTE);
    environment.NODE_OPTIONS = `${environment.NODE_OPTIONS ?? ""} --${HEAP_OPTION_NAME}=${heapMebibytes}`;
  }
  const [executable = "", ...args] = slotCommand;
  const run =
    process.platform === "win32"
      ? spawnSync(slotCommand.map((argument) => quoteArgument(argument)).join(" "), {
          cwd,
          env: environment,
          shell: true,
          stdio: "inherit",
        })
      : spawnSync(executable, args, { cwd, env: environment, stdio: "inherit" });
  return run.status;
};
