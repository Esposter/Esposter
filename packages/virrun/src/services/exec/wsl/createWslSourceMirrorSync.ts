import type { WslSourceMirrorSync } from "@/models/exec/wsl/WslSourceMirrorSync";

import { SOURCE_MIRROR_TIMEOUT_SECONDS } from "@/services/exec/util/constants";
import { buildSourceMirrorManifest } from "@/services/exec/wsl/buildSourceMirrorManifest";
import {
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME,
  VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME,
  VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME,
} from "@/services/exec/wsl/constants";
import { diffSourceMirrorManifests } from "@/services/exec/wsl/diffSourceMirrorManifests";
import { getWslSourceMirrorEntryPath } from "@/services/exec/wsl/getWslSourceMirrorEntryPath";
import { getWslSourceMirrorEntryUnc } from "@/services/exec/wsl/getWslSourceMirrorEntryUnc";
import { getWslSourceMirrorPath } from "@/services/exec/wsl/getWslSourceMirrorPath";
import { readSourceMirrorManifest } from "@/services/exec/wsl/readSourceMirrorManifest";
import { readWslPath } from "@/services/exec/wsl/readWslPath";
import { reapStaleSourceMirrorTemps } from "@/services/exec/wsl/reapStaleSourceMirrorTemps";
import { resolveMirrorExcludes } from "@/services/exec/wsl/resolveMirrorExcludes";
import { shellQuote } from "@/services/exec/wsl/shellQuote";
import { getResult, InvalidOperationError, Operation, toAppError } from "@esposter/shared";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// Plan the win32 source-mirror sync for a host cwd and return { mirrorPath, script }: the ext4 mirror tree's Linux
// Path (the `--overlay-src` lower createWslBwrapArgs points at) plus the sh script that brings it up to date, which
// CreateWslOsBackend folds into the run's own `wsl.exe` invocation ahead of bwrap — no separate sync spawn. The whole
// Win32 os gap was reads of the source lower crossing v9fs (15-64x slower); the mirror moves the toolchain's reads to
// Ext4, and this planner moves the per-run sync's stat-walk to the host FS:
//
// - A fresh host-side walk (buildSourceMirrorManifest) is diffed against the manifest published beside the mirror
//   After the last successful sync. No delta and a present tree ⇒ script "" — the run pays no wsl.exe sync at all.
//   The walk runs unconditionally and synchronously by design: it IS the change detector (the skip decision needs the
//   Current side of the diff, and every sync path publishes that same manifest), and virrun is a one-shot CLI whose
//   Event loop has nothing else to run during planning — off-threading it would add IPC without cutting wall time.
//   Measured ~330ms warm for a ~10k-entry repo on NTFS vs the ~12.5s 9p stat-walk it replaced.
// - A delta stages pid-tagged temps in the entry dir (over the UNC): the next manifest plus null-delimited copy and
//   Delete lists. The script applies them under the mirror lock — `xargs -0 rm -rf` for removals, then rsync
//   `--files-from` reading only the changed files across v9fs — instead of a whole-tree `rsync -a --delete`
//   Quick-check stat-walk of every source file over 9p (measured ~12.5s on a ~5k-file repo even with zero changes).
// - No readable manifest (first run, corrupt file, `cache clean`) falls back to that full rsync, which also
//   Self-heals any mirror-vs-manifest drift; the fresh manifest is published either way.
//
// The publish is the last step inside the flock, via atomic `mv` of the staged temps, so the manifest never claims a
// State the mirror doesn't hold and a concurrent planner reads either the old or the new manifest, never a torn one.
// The exclusive flock still serializes concurrent syncs (`pnpm -r --parallel` at one repo root); `flock -w` +
// `timeout` bound a stalled lock or ext4 volume Linux-side now that there is no execFileSync timeout wrapping a
// Separate spawn. Readers hold the other side of the same lock: createWslOsBackend wraps every run (skip included) in
// A shared flock on lockPath for bwrap's whole duration, so this script's deletes/renames can never land under a live
// Same-cwd reader — the exclusive acquire waits for readers to drain (bounded by the same -w). Write-back is unaffected: persistRun flushes to `options.cwd` (the host /mnt/c path), derived
// Independently of this mirror. A failed sync fails the folded script before bwrap — the os backend never falls back.
//
// Null-delimited so any filename (spaces, newlines) survives the list files; consumed with `xargs -0` / `--from0`.
const joinNullDelimited = (paths: readonly string[]): string => paths.map((path) => `${path}\0`).join("");

export const createWslSourceMirrorSync = (cwd: string): WslSourceMirrorSync => {
  const sourcePath = readWslPath(cwd);
  const entryPath = getWslSourceMirrorEntryPath(cwd);
  const entryUnc = getWslSourceMirrorEntryUnc(cwd);
  const mirrorPath = getWslSourceMirrorPath(cwd);
  const lockPath = `${mirrorPath}.lock`;
  const excludes = resolveMirrorExcludes(cwd);
  const manifest = buildSourceMirrorManifest(cwd, excludes);
  reapStaleSourceMirrorTemps(entryUnc);
  // A manifest is only trusted while the tree it describes exists: a mirror whose tree was removed out-of-band but
  // Whose manifest survived would otherwise diff to an empty/near-empty delta against a gone tree — force the full
  // Rsync instead, which rebuilds tree and manifest together.
  const previousManifest = existsSync(join(entryUnc, VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME))
    ? readSourceMirrorManifest(cwd)
    : undefined;
  const delta = previousManifest === undefined ? undefined : diffSourceMirrorManifests(previousManifest, manifest);
  if (delta?.copyPaths.length === 0 && delta.deletePaths.length === 0) return { lockPath, mirrorPath, script: "" };
  return getResult(() => {
    const tag = `${process.pid}.${randomUUID()}`;
    const manifestTempFilename = `${VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX}${tag}`;
    const originTempFilename = `${VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX}${tag}`;
    mkdirSync(entryUnc, { recursive: true });
    writeFileSync(join(entryUnc, manifestTempFilename), JSON.stringify(manifest));
    // The origin marker is staged host-side like the manifest and published via `mv` (atomic same-fs rename), so a
    // Concurrent reaper reads either the old or the complete new marker, never a half-written path it would misjudge
    // As a dead source — and the temp carries the *host* pid reapStaleSourceMirrorTemps can actually attribute (a
    // Linux-side `$$` temp would sit in the wrong pid domain forever).
    writeFileSync(join(entryUnc, originTempFilename), cwd);
    const publish = `mv ${shellQuote(`${entryPath}/${originTempFilename}`)} ${shellQuote(`${entryPath}/${VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME}`)} && mv ${shellQuote(`${entryPath}/${manifestTempFilename}`)} ${shellQuote(`${entryPath}/${VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME}`)}`;
    const withMirrorLock = (sync: string): string =>
      `mkdir -p ${shellQuote(mirrorPath)} && { flock -w ${SOURCE_MIRROR_TIMEOUT_SECONDS} 9 && ${sync} && ${publish}; } 9> ${shellQuote(lockPath)}`;
    if (delta === undefined) {
      const excludeArgs = excludes.map((exclude) => `--exclude=${shellQuote(exclude)}`).join(" ");
      return withMirrorLock(
        `timeout ${SOURCE_MIRROR_TIMEOUT_SECONDS} rsync -a --delete ${excludeArgs} ${shellQuote(`${sourcePath}/`)} ${shellQuote(`${mirrorPath}/`)}`,
      );
    }
    const copyListFilename = `${VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX}${tag}`;
    const deleteListFilename = `${VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX}${tag}`;
    writeFileSync(join(entryUnc, copyListFilename), joinNullDelimited(delta.copyPaths));
    writeFileSync(join(entryUnc, deleteListFilename), joinNullDelimited(delta.deletePaths));
    const copyListPath = `${entryPath}/${copyListFilename}`;
    const deleteListPath = `${entryPath}/${deleteListFilename}`;
    const sync = `(cd ${shellQuote(mirrorPath)} && xargs -0r rm -rf -- < ${shellQuote(deleteListPath)}) && timeout ${SOURCE_MIRROR_TIMEOUT_SECONDS} rsync -a --from0 --files-from=${shellQuote(copyListPath)} ${shellQuote(`${sourcePath}/`)} ${shellQuote(`${mirrorPath}/`)}`;
    // The list temps are consumed-then-removed only on success; a failed sync aborts the run and leaves them for
    // ReapStaleSourceMirrorTemps to reclaim once this process is dead.
    return `${withMirrorLock(sync)} && rm -f ${shellQuote(copyListPath)} ${shellQuote(deleteListPath)}`;
  }).match(
    (script) => ({ lockPath, mirrorPath, script }),
    (error) => {
      throw new InvalidOperationError(Operation.Create, createWslSourceMirrorSync.name, toAppError(error).message);
    },
  );
};
