import { SOURCE_TREE_HASH_MAX_BUFFER } from "@/services/exec/cache/constants";
import { resolveCwd } from "@/services/exec/util/resolveCwd";
import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readlinkSync } from "node:fs";
import { join } from "node:path";
// Hash one untracked entry's identity: its symlink target, or its file content, or a mode marker for anything else
// (a directory/socket git may list under an odd path). Unreadable (permission denied) falls back to a constant so a
// Non-input the command can't read either never fails the hash. Combined with its path by the caller, so distinct
// Paths never collide even when their markers match.
const hashUntrackedEntry = (fullPath: string): string =>
  getResult(() => {
    const stats = lstatSync(fullPath);
    if (stats.isSymbolicLink()) return `l:${readlinkSync(fullPath)}`;
    else if (stats.isFile()) return `f:${createHash("sha256").update(readFileSync(fullPath)).digest("hex")}`;
    else return `s:${stats.mode}`;
  }).unwrapOr("unreadable");
// A content hash of the working tree exactly as the sandboxed command would read it — the source half of the task
// Cache key (computeTaskCacheKey). Correct against every mutation shape: `git ls-files -s` fingerprints the index
// (committed + staged blob shas), `git diff --binary` layers the unstaged working delta on top (binary content
// Included, not the lossy "Binary files differ" line), and untracked-not-ignored files are hashed by content. So
// Any change — staged, unstaged, or a new file — moves the hash, while a clean tree (CI checkout) needs no per-file
// Reads. Returns null when this is not a git repo (`git` throws), which disables the cache rather than colliding
// Every non-repo onto one key.
export const computeSourceTreeHash = (cwd: string): null | string => {
  const dir = resolveCwd(cwd);
  const runGit = (args: readonly string[]): string =>
    execFileSync("git", args, { cwd: dir, encoding: "utf8", maxBuffer: SOURCE_TREE_HASH_MAX_BUFFER });
  return getResult(() => {
    const indexed = runGit(["ls-files", "-s"]);
    const workingDelta = runGit(["diff", "--binary"]);
    const untracked = runGit(["ls-files", "--others", "--exclude-standard", "-z"]).split("\0").filter(Boolean);
    const untrackedHashes = untracked
      .toSorted()
      .map((relativePath) => `${relativePath}\0${hashUntrackedEntry(join(dir, relativePath))}`)
      .join("\n");
    return createHash("sha256")
      .update(indexed)
      .update("\0")
      .update(workingDelta)
      .update("\0")
      .update(untrackedHashes)
      .digest("hex");
  }).match(
    (hash) => hash,
    () => null,
  );
};
