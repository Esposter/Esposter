import { HOST_SCHEME_REGISTRY_KEY } from "#src/services/installer/constants";
import { getHostInstallDirectory } from "#src/services/installer/getHostInstallDirectory";
import { execFileSync, spawn } from "node:child_process";

// Everything the install left: the link scheme now, and the installed files once this process has exited, since a
// Running executable cannot delete itself on Windows — a detached shell waits a moment, then removes the folder. The
// Wait is `ping`, never `timeout`, which exits at once when its input is not a console, as a detached shell's is not
export const uninstallHost = (): void => {
  execFileSync("reg", ["delete", HOST_SCHEME_REGISTRY_KEY, "/f"], { stdio: "ignore" });
  spawn("cmd.exe", ["/c", `ping -n 3 127.0.0.1 >nul & rmdir /s /q "${getHostInstallDirectory()}"`], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  }).unref();
};
