import { readWslLoginEnvironmentCache } from "@/services/exec/wsl/readWslLoginEnvironmentCache";
// The node a sandboxed command actually runs under. On win32 that is the WSL guest's node (the sandbox is a Linux
// Guest whose PATH comes from readWslLoginEnvironment), a different install — and often a different version — from the
// Windows node hosting this process; everywhere else the sandbox inherits the caller's own node.
//
// Deliberately reads the persisted capture instead of probing: this feeds the cache keys (computeEnvironmentKey) and
// The run banner, both on the hot path of every run, and a capture that has not happened yet would cost a login-shell
// Spawn purely to label a key. createVirrun warms the capture before resolving any location, so the fallback to the
// Host version only applies before a sandbox has ever been built — where there is no snapshot to key against either.
export const getSandboxNodeVersion = (): string =>
  (process.platform === "win32" ? readWslLoginEnvironmentCache()?.nodeVersion : process.version) || process.version;
