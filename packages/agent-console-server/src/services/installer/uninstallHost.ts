import { HOST_SCHEME_REGISTRY_KEY } from "#src/services/installer/constants";
import { getHostInstallDirectory } from "#src/services/installer/getHostInstallDirectory";
import { execFileSync, spawn } from "node:child_process";

// Everything the install left: the link scheme now, and the installed files once this process has exited, since a
// Running executable cannot delete itself on Windows — a detached shell waits a moment, then removes the folder
export const uninstallHost = (): void => {
  execFileSync("reg", ["delete", HOST_SCHEME_REGISTRY_KEY, "/f"], { stdio: "ignore" });
  spawn("cmd.exe", ["/c", `timeout /t 2 /nobreak >nul & rmdir /s /q "${getHostInstallDirectory()}"`], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  }).unref();
};
