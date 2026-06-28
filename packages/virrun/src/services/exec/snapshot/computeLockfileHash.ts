import { PNPM_LOCKFILE_FILENAME } from "@/services/exec/util/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
// The snapshot cache key: a sha256 (hex) of the repo's pnpm lockfile content. Same deps → same hash → the
// Same warm snapshot is reused, and any dependency change yields a new hash so the stale snapshot is never
// Picked up (specs/snapshot-fork.md). Hashing the lockfile bytes rather than parsing keeps it cheap and
// Format-agnostic. A missing lockfile is a misuse — there is nothing to snapshot — so it throws rather than
// Hashing an empty string and silently colliding every lockless repo onto one entry. (Base-image id is part
// Of the eventual key but deferred until the os backend pins one.)
export const computeLockfileHash = (cwd: string): string => {
  const dir = cwd === "" ? process.cwd() : cwd;
  const lockfile = join(dir, PNPM_LOCKFILE_FILENAME);
  if (!existsSync(lockfile))
    throw new InvalidOperationError(Operation.Read, computeLockfileHash.name, `no ${PNPM_LOCKFILE_FILENAME} in ${dir}`);
  return createHash("sha256").update(readFileSync(lockfile)).digest("hex");
};
