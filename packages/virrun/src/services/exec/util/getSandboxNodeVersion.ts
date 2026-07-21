import { readWslExecNodeVersion } from "@/services/exec/wsl/readWslExecNodeVersion";
import { readWslLoginEnvironmentCache } from "@/services/exec/wsl/readWslLoginEnvironmentCache";
// The node a sandboxed command actually runs under. On win32 that is the WSL guest's node (the sandbox is a Linux
// Guest whose PATH comes from readWslLoginEnvironment), a different install — and often a different version — from the
// Windows node hosting this process; everywhere else the sandbox inherits the caller's own node.
//
// Never reports the Windows node on win32. This feeds the cache keys (computeEnvironmentKey), and a snapshot holds
// An *installed* node_modules, so a key naming a major the sandbox does not run is not a stale key but a wrong one —
// The next run under the same mislabel replays native addons built for another ABI. The login capture is read from its
// Persisted tier (createVirrun warms it before any location is resolved, so the hot path never spawns for a label);
// When it is absent the run is already degraded to the guest's default PATH, and readWslExecNodeVersion reports that
// Exact node. "" only when WSL itself is unreachable, which computeEnvironmentKey buckets as unprobed.
export const getSandboxNodeVersion = (): string =>
  process.platform === "win32"
    ? readWslLoginEnvironmentCache()?.nodeVersion || readWslExecNodeVersion()
    : process.version;
