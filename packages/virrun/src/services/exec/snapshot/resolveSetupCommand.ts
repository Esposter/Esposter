import { SETUP_COMMAND_LINUX, SETUP_COMMAND_WIN32 } from "@/services/exec/snapshot/constants";
// Picks the snapshot setup command by platform; the win32-vs-linux split is explained at SETUP_COMMAND_* in constants.
export const resolveSetupCommand = (): string =>
  process.platform === "win32" ? SETUP_COMMAND_WIN32 : SETUP_COMMAND_LINUX;
