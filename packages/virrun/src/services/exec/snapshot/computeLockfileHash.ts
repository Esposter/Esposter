import { PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { resolveWorkspaceRoot } from "@/services/exec/util/resolveWorkspaceRoot";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
// The snapshot cache key: a sha256 of the lockfile bytes (cheap, format-agnostic), resolved from the workspace root
// So the key is identical whether virrun runs from the repo root or a subpackage (specs/snapshot-fork.md). A missing
// Lockfile throws (via resolveWorkspaceRoot) rather than hashing "" and colliding every lockless repo onto one entry.
export const computeLockfileHash = (cwd: string): string =>
  createHash("sha256")
    .update(readFileSync(join(resolveWorkspaceRoot(cwd), PNPM_LOCKFILE_FILENAME)))
    .digest("hex");
