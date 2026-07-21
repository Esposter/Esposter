import { readWslExecNodeVersion } from "@/services/exec/wsl/readWslExecNodeVersion";
import { readWslLoginEnvironment } from "@/services/exec/wsl/readWslLoginEnvironment";
// The node a sandboxed command actually runs under. On win32 that is the WSL guest's node (the sandbox is a Linux
// Guest whose PATH comes from readWslLoginEnvironment), a different install — and often a different version — from the
// Windows node hosting this process; everywhere else the sandbox inherits the caller's own node.
//
// Never reports the Windows node on win32. This feeds the cache keys (computeEnvironmentKey), and a snapshot holds
// An *installed* node_modules, so a key naming a major the sandbox does not run is not a stale key but a wrong one —
// The next run under the same mislabel replays native addons built for another ABI. So the version is read from the
// Same call createOsExecOptions builds the run's PATH from, not from the persisted capture alone: the two disagree
// Exactly when the capture fails, where the run gets no injected PATH but a stale persisted capture would still name
// Fnm's node. That call is memoised in-process (createVirrun warms it before any location is resolved), so reading it
// Here costs nothing the run was not already paying. Without an injected PATH the guest resolves node off its default
// PATH, which is what readWslExecNodeVersion reports; "" only when WSL itself is unreachable, which
// ComputeEnvironmentKey buckets as unprobed.
export const getSandboxNodeVersion = (): string => {
  if (process.platform !== "win32") return process.version;
  const { nodeVersion, path } = readWslLoginEnvironment();
  return path && nodeVersion ? nodeVersion : readWslExecNodeVersion();
};
