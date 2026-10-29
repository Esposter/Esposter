import { getResult } from "@esposter/shared";
import { execFileSync } from "@esposter/shared-node/child-process";

// When a process started, in epoch milliseconds, from the operating system's own record: PowerShell's start time on
// Windows, `ps`'s start time elsewhere. Undefined when the process is gone
export const getProcessStartedAt = (processId: number): number | undefined => {
  const isWindows = process.platform === "win32";
  const output = getResult(() =>
    execFileSync(
      isWindows ? "powershell" : "ps",
      isWindows
        ? [
            "-NoProfile",
            "-Command",
            `([DateTimeOffset](Get-Process -Id ${processId}).StartTime).ToUnixTimeMilliseconds()`,
          ]
        : ["-o", "lstart=", "-p", String(processId)],
      { encoding: "utf8" },
    ),
  ).match(
    (text) => text.trim(),
    () => "",
  );
  const startedAt = isWindows ? Number(output) : Date.parse(output);
  return Number.isFinite(startedAt) && startedAt > 0 ? startedAt : undefined;
};
