import { computeLockfileHash } from "@/services/exec/snapshot/computeLockfileHash";
import { getSandboxNodeVersion } from "@/services/exec/util/getSandboxNodeVersion";
import { createHash } from "node:crypto";

const NODE_MAJOR_REGEX = /^v?(?<major>\d+)/u;
// The provisioned environment a cached artifact belongs to: the dependency closure (lockfile digest) paired with the
// Node major the sandbox runs. Node is part of the key because the snapshot holds an *installed* node_modules — native
// Addons are compiled per ABI and pnpm resolves engine-conditional deps at install time — so replaying a snapshot,
// Prepare layer or task result built under another major is not a cache hit but a wrong answer. Major, not the full
// Version: the ABI is stable within a major, and keying on the patch would discard a multi-GB snapshot on every
// Routine node bump. An unparseable version contributes "" — one shared bucket, no throw, since a missing version
// Only ever means the sandbox has not been probed yet.
export const computeEnvironmentKey = (cwd: string): string =>
  createHash("sha256")
    .update(computeLockfileHash(cwd))
    .update("\0")
    .update(NODE_MAJOR_REGEX.exec(getSandboxNodeVersion())?.groups?.major ?? "")
    .digest("hex");
