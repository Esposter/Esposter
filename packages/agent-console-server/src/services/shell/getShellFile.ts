import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";

// PowerShell 7 and later, installed beside Windows rather than with it, and found on the path its installer adds
const POWERSHELL_FILE = "pwsh.exe";
// The Windows PowerShell every Windows ships, for a computer that has no newer one
const WINDOWS_POWERSHELL_FILE = "powershell.exe";

// The shell a new terminal runs: the newest PowerShell on Windows, as Windows Terminal's default profile opens it, and
// The person's own elsewhere
export const getShellFile = (): string => {
  if (process.platform !== "win32") return process.env.SHELL ?? "/bin/sh";
  const pathDirectories = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
  return pathDirectories.some((pathDirectory) => existsSync(join(pathDirectory, POWERSHELL_FILE)))
    ? POWERSHELL_FILE
    : WINDOWS_POWERSHELL_FILE;
};
