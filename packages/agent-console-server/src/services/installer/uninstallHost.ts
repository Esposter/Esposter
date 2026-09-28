import { HOST_SCHEME_REGISTRY_KEY } from "#src/services/installer/constants";
import { getHostInstallDirectory } from "#src/services/installer/getHostInstallDirectory";
import { execFileSync, spawn } from "node:child_process";

// Everything the install left: the link scheme now, and the installed files once this process has exited, since a
// Running executable cannot delete itself on Windows — a detached PowerShell waits a moment, then removes the folder.
// The folder reaches it through the environment and is read as a literal path, so no command is built from a path
export const uninstallHost = (): void => {
  execFileSync("reg", ["delete", HOST_SCHEME_REGISTRY_KEY, "/f"], { stdio: "ignore" });
  spawn(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      "Start-Sleep -Seconds 2; Remove-Item -LiteralPath $env:ESPOSTER_HOST_DIRECTORY -Recurse -Force",
    ],
    {
      detached: true,
      env: { ...process.env, ESPOSTER_HOST_DIRECTORY: getHostInstallDirectory() },
      stdio: "ignore",
      windowsHide: true,
    },
  ).unref();
};
