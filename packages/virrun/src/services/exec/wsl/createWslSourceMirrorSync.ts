import type { WslSourceMirrorSync } from "#src/models/exec/wsl/WslSourceMirrorSync";

import { checkIsBareNameExclude } from "#src/services/exec/util/checkIsBareNameExclude";
import { SOURCE_MIRROR_TIMEOUT_SECONDS } from "#src/services/exec/util/constants";
import { buildSourceMirrorManifest } from "#src/services/exec/wsl/buildSourceMirrorManifest";
import {
  VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME,
  VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME,
  VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME,
} from "#src/services/exec/wsl/constants";
import { createSourceMirrorArchive } from "#src/services/exec/wsl/createSourceMirrorArchive";
import { diffSourceMirrorManifests } from "#src/services/exec/wsl/diffSourceMirrorManifests";
import { getChangedExcludes } from "#src/services/exec/wsl/getChangedExcludes";
import { getWslSourceMirrorEntryPath } from "#src/services/exec/wsl/getWslSourceMirrorEntryPath";
import { getWslSourceMirrorEntryUnc } from "#src/services/exec/wsl/getWslSourceMirrorEntryUnc";
import { getWslSourceMirrorPath } from "#src/services/exec/wsl/getWslSourceMirrorPath";
import { joinNullDelimited } from "#src/services/exec/wsl/joinNullDelimited";
import { publishSourceMirrorOrigin } from "#src/services/exec/wsl/publishSourceMirrorOrigin";
import { readSourceMirrorPublication } from "#src/services/exec/wsl/readSourceMirrorPublication";
import { reapStaleSourceMirrorTemps } from "#src/services/exec/wsl/reapStaleSourceMirrorTemps";
import { shellQuote } from "#src/services/exec/wsl/shellQuote";
import { getResult, InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// Whether the two exclude sets disagree on a bare name — the one exclude shape a delete list can't target, since it
// Matches that segment at any depth rather than one path. The changed set itself comes from getChangedExcludes, the
// Same derivation diffSourceMirrorManifests turns into deletes, so the two can never disagree on what changed.
const checkHasBareNameExcludeChange = (previous: readonly string[], current: readonly string[]): boolean =>
  getChangedExcludes(previous, current).some((exclude) => checkIsBareNameExclude(exclude));
// Plan the win32 source-mirror sync for a host cwd and return { mirrorPath, script }: the ext4 mirror tree's Linux
// Path (the `--overlay-src` lower createWslBwrapArgs points at) plus the sh script that brings it up to date, which
// `createWslOsBackend` folds into the run's own `wsl.exe` invocation ahead of bwrap — no separate sync spawn. The whole
// Win32 os gap was reads of the source lower crossing v9fs (an order of magnitude slower or worse); the mirror moves
// The toolchain's reads to ext4, the manifest diff moves the per-run change detection to the host FS, and the staged
// Archive moves the data plane off per-file 9p round-trips:
//
// - A fresh host-side walk (buildSourceMirrorManifest) is diffed against the manifest published beside the mirror
//   After the last successful sync. No delta and a present tree ⇒ script "" — the run pays no wsl.exe sync at all.
//   The walk runs unconditionally and synchronously by design: it IS the change detector (the skip decision needs the
//   Current side of the diff, and every sync path publishes that same manifest), and virrun is a one-shot CLI whose
//   Event loop has nothing else to run during planning — off-threading it would add IPC without cutting wall time.
//   Sub-second warm on NTFS, against a 9p stat-walk an order of magnitude slower.
// - A delta stages pid-tagged temps in the entry dir (over the UNC): the next manifest, the null-delimited delete
//   List, and a tar archive of the copied paths built host-side (createSourceMirrorArchive — native NTFS reads, one
//   Sequential 9p write). The script applies them under the mirror lock: `xargs -0 rm -rf` for removals, then a local
//   Ext4 `tar -x` into `tree/` — no source file ever crosses v9fs individually. `chmod -R 777` after the extract
//   Restores the drvfs-parity modes the sandbox expects (bsdtar records NTFS entries mode-less as 644/755, which
//   Would strip the exec bits repo scripts rely on inside the sandbox). Symlinks ship preserved (their relative
//   Targets are mirrored too, so they resolve at extract) and a path the archive couldn't capture — Windows-locked, or
//   Vanished since the walk — is skipped and pruned from the published manifest rather than fatal
//   (createSourceMirrorArchive).
// - No readable manifest (first run, corrupt file, `cache clean`), a missing tree, or a manifest published under a
//   Different exclude set than the one in force now materializes from scratch: the
//   Archive carries the whole manifest file set and the script clears `tree/` before extracting, which also
//   Self-heals any mirror-vs-manifest drift — including the copies a since-added exclude orphaned, which no delta
//   Could ever delete; the fresh manifest is published either way. A whole-tree
//   `rsync -a --delete` here would read every source file across v9fs, so a cold materialize could blow past the
//   Timeout; the archive does it in seconds.
//
// The publish is the last step inside the flock, via atomic `mv` of the staged temps, so the manifest never claims a
// State the mirror doesn't hold and a concurrent planner reads either the old or the new manifest, never a torn one.
// The exclusive flock still serializes concurrent syncs (`pnpm -r --parallel` at one repo root); `flock -w` +
// `timeout` bound a stalled lock or ext4 volume Linux-side as pure hang guards — the bounded work is one local
// Extract, not a cross-boundary copy. Readers hold the other side of the same lock: createWslOsBackend wraps every
// Run (skip included) in a shared flock on lockPath for bwrap's whole duration, so this script's deletes/renames can
// Never land under a live same-cwd reader — the exclusive acquire waits for readers to drain (bounded by the same
// -w). Write-back's target is unaffected: persistRun flushes to `options.cwd` (the host /mnt/c path), derived
// Independently of this mirror — but its *set* is not, since a path this sync excludes is one the flush must mask,
// Or the sandbox could write the host a path the mirror never carried. `excludes` is therefore handed in rather than
// Resolved here: the caller resolves it once from the run's own `environment` (createWslOsBackend) and createVirrun
// Derives `maskedPaths` from that same `environment`, so the walk and the mask cannot describe different sets.
// A failed sync fails the folded script before bwrap — the os backend never falls back.
export const createWslSourceMirrorSync = (cwd: string, excludes: readonly string[]): WslSourceMirrorSync => {
  const entryPath = getWslSourceMirrorEntryPath(cwd);
  const entryUnc = getWslSourceMirrorEntryUnc(cwd);
  const mirrorPath = getWslSourceMirrorPath(cwd);
  const lockPath = `${mirrorPath}.lock`;
  const manifest = buildSourceMirrorManifest(cwd, excludes);
  reapStaleSourceMirrorTemps(entryUnc);
  // A manifest is only trusted while the tree it describes exists: a mirror whose tree was removed out-of-band but
  // Whose manifest survived would otherwise diff to an empty/near-empty delta against a gone tree — force the full
  // Materialize instead, which rebuilds tree and manifest together.
  const publication = existsSync(join(entryUnc, VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME))
    ? readSourceMirrorPublication(cwd)
    : undefined;
  // …and only while every exclude it disagrees with can be reconciled by a targeted delete. The exclude set is not
  // Constant — linked worktrees come and go while a repo is worked on — and a path on either side of that change is
  // In neither manifest, so the entries diff alone can never emit a delete for it and the mirror keeps its copy
  // Forever: read by the sandbox as if it were source, and copied up into the write-back's upper by any tool that
  // Rewrites it. DiffSourceMirrorManifests turns each disagreement into an `rm -rf`, which is a no-op on a mirror
  // That never held it. A *bare-name* change is the one shape a path list can't express (it matches at any depth),
  // So that alone falls back to the clearing full materialize.
  const current = { entries: manifest, excludes };
  const previous =
    publication !== undefined && !checkHasBareNameExcludeChange(publication.excludes, excludes)
      ? publication
      : undefined;
  const delta = previous === undefined ? undefined : diffSourceMirrorManifests(previous, current);
  if (delta?.copyPaths.length === 0 && delta.deletePaths.length === 0) {
    // A live repo returns here on nearly every run, so this is where a marker that failed to publish gets a second
    // Chance. Without it the reaper's "no marker and old enough" arm has no invariant to stand on: one swallowed
    // Rename would leave a mirror this repo keeps using unattributable, and a day later the sweep would rm -rf it
    // Out from under a run. Republished only when absent, so the common path still costs no write
    if (!existsSync(join(entryUnc, VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME))) publishSourceMirrorOrigin(entryUnc, cwd);
    return { lockPath, mirrorPath, script: "" };
  }
  return getResult(() => {
    const tag = `${process.pid}.${crypto.randomUUID()}`;
    const manifestTempFilename = `${VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX}${tag}`;
    mkdirSync(entryUnc, { recursive: true });
    // The abandonment reaper can only reclaim an entry it can attribute, so the origin marker is published the moment
    // The entry dir exists rather than at the end of a successful sync: a materialize that dies midway (a killed run,
    // A failed archive) would otherwise leave an unattributable dir no sweep may ever touch, and those corpses
    // Accumulate for the life of the machine — gigabytes of ext4 on a box whose test suite runs virrun in temp dirs.
    // The publish is best-effort (publishSourceMirrorOrigin), which every planning pass makes safe by republishing
    // A missing marker — including the no-delta early return above, the path a live repo takes on nearly every run
    publishSourceMirrorOrigin(entryUnc, cwd);
    const copyPaths = delta === undefined ? Object.keys(manifest).toSorted() : delta.copyPaths;
    const consumedPaths: string[] = [];
    let archivePath = "";
    if (copyPaths.length > 0) {
      const { archiveFilename, unarchivedPaths } = createSourceMirrorArchive(cwd, entryUnc, copyPaths, tag);
      archivePath = `${entryPath}/${archiveFilename}`;
      consumedPaths.push(archivePath);
      // A copy path the archive lacks must not be published as held: pruning keeps the manifest honest and later runs
      // Retry it (a locked file until readable; a vanished one is simply gone from the next walk), instead of one
      // Skipped file hard-failing the run.
      for (const unarchivedPath of unarchivedPaths) delete manifest[unarchivedPath];
    }
    // The manifest is staged host-side as a pid-tagged temp and published by the script via `mv` (atomic same-fs
    // Rename) as the last step inside the lock, so it never claims a state the mirror doesn't hold and a concurrent
    // Planner reads either the old or the new one, never a torn file. The temp carries the *host* pid
    // `reapStaleSourceMirrorTemps` can attribute (a Linux-side `$$` temp would sit in the wrong pid domain forever).
    writeFileSync(join(entryUnc, manifestTempFilename), JSON.stringify(current));
    const publish = `mv ${shellQuote(`${entryPath}/${manifestTempFilename}`)} ${shellQuote(`${entryPath}/${VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME}`)}`;
    const withMirrorLock = (sync: string): string =>
      `mkdir -p ${shellQuote(mirrorPath)} && { flock -w ${SOURCE_MIRROR_TIMEOUT_SECONDS} 9 && ${sync} && ${publish}; } 9> ${shellQuote(lockPath)}`;
    const extract = archivePath
      ? [
          // `--warning=no-unknown-keyword` quiets GNU tar's per-symlink "Ignoring unknown extended header keyword
          // 'LIBARCHIVE.symlinktype'" line: a benign pax header the win32 bsdtar writer stamps on every archived
          // Symlink to record its file-vs-dir target kind. That distinction is meaningless on Linux — extraction
          // Recreates the symlink correctly and exits 0 with or without it — so it is pure noise at this boundary.
          // This command only ever runs under WSL GNU tar (the mirror is win32-only; a native-Linux run uses the os
          // Backend, not this archive), and the archive itself stays standard pax for any other reader.
          `timeout ${SOURCE_MIRROR_TIMEOUT_SECONDS} tar --warning=no-unknown-keyword -xf ${shellQuote(archivePath)} -C ${shellQuote(mirrorPath)}`,
          `chmod -R 777 ${shellQuote(mirrorPath)}`,
        ]
      : [];
    let sync: string[];
    if (delta === undefined)
      // Materialize from scratch: clearing `tree/` before the extract is what self-heals mirror-vs-manifest drift —
      // The archive holds the complete mirrored set, so nothing stale can survive it.
      sync = [`rm -rf ${shellQuote(mirrorPath)}`, `mkdir -p ${shellQuote(mirrorPath)}`, ...extract];
    else {
      const deleteListFilename = `${VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX}${tag}`;
      writeFileSync(join(entryUnc, deleteListFilename), joinNullDelimited(delta.deletePaths));
      const deleteListPath = `${entryPath}/${deleteListFilename}`;
      consumedPaths.push(deleteListPath);
      sync = [`(cd ${shellQuote(mirrorPath)} && xargs -0r rm -rf -- < ${shellQuote(deleteListPath)})`, ...extract];
    }
    // The staged temps are consumed-then-removed only on success; a failed sync aborts the run and leaves them for
    // `reapStaleSourceMirrorTemps` to reclaim once this process is dead.
    const cleanup =
      consumedPaths.length === 0 ? "" : ` && rm -f ${consumedPaths.map((path) => shellQuote(path)).join(" ")}`;
    return `${withMirrorLock(sync.join(" && "))}${cleanup}`;
  }).match(
    (script) => ({ lockPath, mirrorPath, script }),
    (error) => {
      throw new InvalidOperationError(Operation.Create, createWslSourceMirrorSync.name, error.message);
    },
  );
};
