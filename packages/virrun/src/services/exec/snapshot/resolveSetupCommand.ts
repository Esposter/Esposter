import { SETUP_COMMAND_LINUX, SETUP_COMMAND_WIN32 } from "@/services/exec/snapshot/constants";
// The command captured into the warm snapshot to provision the sandbox's own dependency closure: a frozen
// Install of the lockfile. On Windows the sandbox is a Linux (WSL) guest whose node_modules must be the Linux
// Platform's — the host's win32 binaries can't run there — so deps are installed inside it via corepack's pnpm
// (the WSL login PATH brings node + corepack, but not necessarily a global pnpm). On Linux the caller's shell
// Already exposes pnpm, so it is invoked directly. --frozen-lockfile keeps the install reproducible and a no-op
// When deps already match, so a captured snapshot stays valid until the lockfile hash (its cache key) changes.
export const resolveSetupCommand = (): string =>
  process.platform === "win32" ? SETUP_COMMAND_WIN32 : SETUP_COMMAND_LINUX;
