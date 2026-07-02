import { SOURCE_MIRROR_TIMEOUT_MS } from "@/services/exec/util/constants";
import { getWslSourceMirrorPath } from "@/services/exec/wsl/getWslSourceMirrorPath";
import { readWslPath } from "@/services/exec/wsl/readWslPath";
import { getResult, InvalidOperationError, Operation, toAppError } from "@esposter/shared";
import { execFileSync } from "node:child_process";
// Before a win32 os run, incrementally sync the repo source onto a WSL-native ext4 mirror and return that mirror's
// Linux path, so createWslBwrapArgs points `--overlay-src`/`--chdir` at ext4 instead of /mnt/c. The whole win32 os
// Gap is that reads of the source lower cross v9fs (15-64x slower); the mirror moves them to native ext4 speed. The
// Mirror is per-repo, keyed by sha256 of the host cwd (distinct repos/worktrees never collide), a sibling of the
// Snapshot + task caches under the ext4 root.
//
// - `rsync -a --delete` copies only changed files (mtime/size quick-check) and drops files removed on the host, so
//   The mirror stays == the working tree; the first run materializes it, every later run is a cheap delta.
// - node_modules + .git are excluded (unanchored, so at every depth): node_modules comes from the snapshot RO lower
//   Stacked over this source lower (never the source), and .git is large, churns every commit, and no dev-loop
//   Command reads it. Everything else is mirrored — over-copy is correctness-safe, under-copy is a bug.
// - An exclusive `flock` serializes concurrent syncs (e.g. `pnpm -r --parallel` firing several commands at the same
//   Repo root → same mirror): each waits, then rsync is a no-op because the shared working tree hasn't changed, so a
//   Sibling run's bwrap reading the mirror never observes a mid-sync mutation.
//
// Write-back is unaffected: persistRun flushes to `options.cwd` (the host /mnt/c path), derived independently of this
// Mirror, and the mirror reproduces the host tree layout exactly so an upper entry's relative path maps back 1:1. A
// Failed sync (rsync missing, ext4 full) aborts the run here — the os backend never falls back — surfaced ahead of
// Time by `virrun doctor`.
//
// Paths are single-quoted before embedding in the sh -c script: double quotes still expand $(), backticks, and $VAR,
// So a repo path or WSL home with shell metacharacters would otherwise be interpreted (CWE-78). Single quotes suppress
// All expansion; an embedded `'` is closed, escaped, and reopened.
const shellQuote = (value: string): string => `'${value.replaceAll("'", `'\\''`)}'`;

export const ensureWslSourceMirror = (cwd: string): string => {
  const sourcePath = readWslPath(cwd);
  const mirrorPath = getWslSourceMirrorPath(cwd);
  const script = [
    `mkdir -p ${shellQuote(mirrorPath)}`,
    `flock ${shellQuote(`${mirrorPath}.lock`)} rsync -a --delete --exclude=node_modules --exclude=.git ${shellQuote(`${sourcePath}/`)} ${shellQuote(`${mirrorPath}/`)}`,
  ].join(" && ");
  return getResult(() =>
    execFileSync("wsl.exe", ["--exec", "sh", "-c", script], {
      encoding: "utf8",
      stdio: "pipe",
      timeout: SOURCE_MIRROR_TIMEOUT_MS,
    }),
  ).match(
    () => mirrorPath,
    (error) => {
      throw new InvalidOperationError(Operation.Create, ensureWslSourceMirror.name, toAppError(error).message);
    },
  );
};
