import { PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { resolveWorkspaceRoot } from "@/services/exec/util/resolveWorkspaceRoot";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
// The snapshot cache key: a sha256 (hex) of the repo's pnpm lockfile content. Same deps → same hash → the
// Same warm snapshot is reused, and any dependency change yields a new hash so the stale snapshot is never
// Picked up (specs/snapshot-fork.md). Hashing the lockfile bytes rather than parsing keeps it cheap and
// Format-agnostic. The lockfile is located at the workspace root (walking up from cwd), so the key is the same
// Whether virrun runs from the repo root or a subpackage. A missing lockfile anywhere up the tree is misuse —
// There is nothing to snapshot — so resolveWorkspaceRoot throws rather than hashing an empty string and silently
// Colliding every lockless repo onto one entry. (Base-image id is part of the eventual key but deferred until
// The os backend pins one.)
export const computeLockfileHash = (cwd: string): string =>
  createHash("sha256")
    .update(readFileSync(join(resolveWorkspaceRoot(cwd), PNPM_LOCKFILE_FILENAME)))
    .digest("hex");
