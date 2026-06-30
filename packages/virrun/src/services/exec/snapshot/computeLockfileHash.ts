import { PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { resolveWorkspaceRoot } from "@/services/exec/util/resolveWorkspaceRoot";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
// Memoize the digest per resolved lockfile path, invalidated when the file's mtime or size changes. A single
// `fork`/`persist` resolves the snapshot location 2-3 times (ensureSnapshot, then forkSnapshot/persistRun, plus
// createSnapshot on a cold path), and a long-lived process (the warm daemon) re-resolves on every dispatch — each
// Otherwise re-reads and re-sha256s a multi-MB monorepo lockfile. The stat guard keeps the cache honest if the
// Lockfile is rewritten in-process (an install regenerates it); size alone catches any content-length change even
// On a filesystem whose mtime resolution is too coarse to register a fast rewrite.
const lockfileHashCache = new Map<string, { hash: string; mtimeMs: number; size: number }>();
// The snapshot cache key: a sha256 of the lockfile bytes (cheap, format-agnostic), resolved from the workspace root
// So the key is identical whether virrun runs from the repo root or a subpackage (specs/snapshot-fork.md). A missing
// Lockfile throws (via resolveWorkspaceRoot) rather than hashing "" and colliding every lockless repo onto one entry.
export const computeLockfileHash = (cwd: string): string => {
  const lockfilePath = join(resolveWorkspaceRoot(cwd), PNPM_LOCKFILE_FILENAME);
  const { mtimeMs, size } = statSync(lockfilePath);
  const cached = lockfileHashCache.get(lockfilePath);
  if (cached?.mtimeMs === mtimeMs && cached.size === size) return cached.hash;
  const hash = createHash("sha256").update(readFileSync(lockfilePath)).digest("hex");
  lockfileHashCache.set(lockfilePath, { hash, mtimeMs, size });
  return hash;
};
