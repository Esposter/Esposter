import { getResult } from "@esposter/shared";
import { execFileSync } from "@esposter/shared-node/child-process";

// The process listening on a port, by the operating system's own table: PowerShell's TCP connections on Windows, which
// List IPv6 listeners too (netstat's TCP view lists only IPv4), and lsof elsewhere. Undefined when nothing listens there
export const getListeningProcessId = (port: number): number | undefined => {
  const output = getResult(() =>
    process.platform === "win32"
      ? execFileSync(
          "powershell",
          [
            "-NoProfile",
            "-Command",
            `(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1).OwningProcess`,
          ],
          { encoding: "utf8" },
        )
      : execFileSync("lsof", ["-nP", "-t", `-iTCP:${port}`, "-sTCP:LISTEN"], { encoding: "utf8" }),
  ).match(
    (text) => text,
    // The lsof command exits with an error when nothing listens on the port, which is an answer rather than a failure
    () => "",
  );
  const id = Number(output.trim().split("\n")[0]);
  return Number.isInteger(id) && id > 0 ? id : undefined;
};
