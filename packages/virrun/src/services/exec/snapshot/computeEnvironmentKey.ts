import { computeLockfileHash } from "@/services/exec/snapshot/computeLockfileHash";
import { getSandboxNodeVersion } from "@/services/exec/util/getSandboxNodeVersion";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";

const NODE_MAJOR_REGEX = /^v?(?<major>\d+)/u;
// The provisioned environment a cached artifact belongs to: the dependency closure (lockfile digest) paired with the
// Node major the sandbox runs. Node is part of the key because the snapshot holds an *installed* node_modules — native
// Addons are compiled per ABI and pnpm resolves engine-conditional deps at install time — so replaying a snapshot,
// Prepare layer or task result built under another major is not a cache hit but a wrong answer. Major, not the full
// Version: the ABI is stable within a major, and keying on the patch would discard a multi-GB snapshot on every
// Routine node bump.
//
// An unreadable version throws rather than contributing "" to a shared bucket. Unlike the lockfile digest this half of
// The key is *probed*, so it can fail transiently (a cold WSL service overruns the login-shell capture), and the very
// Next thing every caller does is prune: pruneStaleSnapshots/pruneStalePrepareLayers reclaim every entry whose name is
// Not this hash, so one degraded key reaps the multi-GB snapshot the correct key still points at, and the run then
// Dies in createOsExecOptions anyway for want of a sandbox PATH. Failing before the sweep costs that run nothing and
// Keeps the warm cache.
export const computeEnvironmentKey = (cwd: string): string => {
  const nodeVersion = getSandboxNodeVersion();
  const major = NODE_MAJOR_REGEX.exec(nodeVersion)?.groups?.major;
  if (!major)
    throw new InvalidOperationError(Operation.Read, cwd, `sandbox node version is unreadable: "${nodeVersion}"`);
  return createHash("sha256").update(computeLockfileHash(cwd)).update("\0").update(major).digest("hex");
};
