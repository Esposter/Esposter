import { readWslLoginEnvironment } from "#src/services/exec/wsl/readWslLoginEnvironment";
// The node a sandboxed command actually runs under. On win32 that is the WSL guest's node (the sandbox is a Linux
// Guest whose PATH comes from readWslLoginEnvironment), a different install — and often a different version — from the
// Windows node hosting this process; everywhere else the sandbox inherits the caller's own node.
//
// Never reports the Windows node on win32, and never substitutes a probe for a failed capture. This feeds the cache
// Keys (computeEnvironmentKey), and a snapshot holds an *installed* node_modules, so a key naming a major the sandbox
// Does not run is not a stale key but a wrong one — the next run under the same mislabel replays native addons built
// For another ABI. A degraded capture has no answer to give: createOsExecOptions refuses to run without an injected
// PATH, so there is no run whose node could be reported, and inventing a plausible one (the guest's default-PATH node)
// Mints a valid-but-different key whose first act is to prune the warm snapshot the correct key still points at.
// "" is the honest answer, and computeEnvironmentKey throws on it before anything sweeps.
export const getSandboxNodeVersion = (): string => {
  if (process.platform !== "win32") return process.version;
  const { nodeVersion, path } = readWslLoginEnvironment();
  return path ? nodeVersion : "";
};
