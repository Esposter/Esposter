import { join } from "node:path";

// The system's own tar, named by its path so a tar of the same name on the PATH is never run: System32's bsdtar on
// Windows, and /usr/bin's on macOS. Both read a zip or a tar.xz by its contents
export const getSystemTarPath = (): string =>
  process.platform === "win32"
    ? join(process.env.SystemRoot ?? String.raw`C:\Windows`, "System32", "tar.exe")
    : "/usr/bin/tar";
