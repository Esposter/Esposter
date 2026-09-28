import { HOST_INSTALL_DIRECTORY_SEGMENTS } from "#src/services/installer/constants";
import { homedir } from "node:os";
import { join } from "node:path";

export const getHostInstallDirectory = (): string =>
  join(process.env.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"), ...HOST_INSTALL_DIRECTORY_SEGMENTS);
