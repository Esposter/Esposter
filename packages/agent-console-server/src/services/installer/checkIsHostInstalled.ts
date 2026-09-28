import { getHostInstallDirectory } from "#src/services/installer/getHostInstallDirectory";
import { dirname, relative } from "node:path";

// The executable is the installed one when it runs from the install directory; a download run from anywhere else
// Installs itself first. Windows paths compare without case, which relative() honours on Windows
export const checkIsHostInstalled = (): boolean =>
  relative(getHostInstallDirectory(), dirname(process.execPath)) === "";
