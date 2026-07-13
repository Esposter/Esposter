import type { WslSourceMirrorSync } from "@/models/exec/wsl/WslSourceMirrorSync";

import { SOURCE_MIRROR_TIMEOUT_SECONDS } from "@/services/exec/util/constants";
import { buildSourceMirrorManifest } from "@/services/exec/wsl/buildSourceMirrorManifest";
import {
  VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME,
  VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME,
  VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME,
} from "@/services/exec/wsl/constants";
import { createSourceMirrorArchive } from "@/services/exec/wsl/createSourceMirrorArchive";
import { diffSourceMirrorManifests } from "@/services/exec/wsl/diffSourceMirrorManifests";
import { getWslSourceMirrorEntryPath } from "@/services/exec/wsl/getWslSourceMirrorEntryPath";
import { getWslSourceMirrorEntryUnc } from "@/services/exec/wsl/getWslSourceMirrorEntryUnc";
import { getWslSourceMirrorPath } from "@/services/exec/wsl/getWslSourceMirrorPath";
import { joinNullDelimited } from "@/services/exec/wsl/joinNullDelimited";
import { readSourceMirrorManifest } from "@/services/exec/wsl/readSourceMirrorManifest";
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
// Win32 os gap was reads of the source lower crossing v9fs (an order of magnitude slower or worse); the mirror moves
// The toolchain's reads to ext4, the manifest diff moves the per-run change detection to the host FS, and the staged
// Archive moves the data plane off per-file 9p round-trips:
//
// - A fresh host-side walk (buildSourceMirrorManifest) is diffed against the manifest published beside the mirror
//   After the last successful sync. No delta and a present tree ⇒ script "" — the run pays no wsl.exe sync at all.
//   The walk runs unconditionally and synchronously by design: it IS the change detector (the skip decision needs the
//   Current side of the diff, and every sync path publishes that same manifest), and virrun is a one-shot CLI whose
//   Event loop has nothing else to run during planning — off-threading it would add IPC without cutting wall time.
//   Measured sub-second warm on NTFS vs the >10s 9p stat-walk it replaced.
// - A delta stages pid-tagged temps in the entry dir (over the UNC): the next manifest, the null-delimited delete
//   List, and a tar archive of the copied paths built host-side (createSourceMirrorArchive — native NTFS reads, one
//   Sequential 9p write). The script applies them under the mirror lock: `xargs -0 rm -rf` for removals, then a local
//   Ext4 `tar -x` into `tree/` — no source file ever crosses v9fs individually. `chmod -R 777` after the extract
//   Restores the drvfs-parity modes the old rsync propagated (bsdtar records NTFS entries mode-less as 644/755, which
//   Would strip the exec bits repo scripts rely on inside the sandbox). Symlinks ship preserved (their relative
//   Targets are mirrored too, so they resolve at extract) and a Windows-locked file is skipped and pruned from the
//   Published manifest rather than fatal (createSourceMirrorArchive).
// - No readable manifest (first run, corrupt file, `cache clean`) or a missing tree materializes from scratch: the
//   Archive carries the whole manifest file set and the script clears `tree/` before extracting, which also
//   Self-heals any mirror-vs-manifest drift; the fresh manifest is published either way. The old whole-tree
//   `rsync -a --delete` here read every source file across v9fs — a cold materialize could blow past the 5-minute
//   Timeout; the archive does it in seconds.
//
// The publish is the last step inside the flock, via atomic `mv` of the staged temps, so the manifest never claims a
// State the mirror doesn't hold and a concurrent planner reads either the old or the new manifest, never a torn one.
// The exclusive flock still serializes concurrent syncs (`pnpm -r --parallel` at one repo root); `flock -w` +
// `timeout` bound a stalled lock or ext4 volume Linux-side as pure hang guards — the bounded work is one local
// Extract, not a cross-boundary copy. Readers hold the other side of the same lock: createWslOsBackend wraps every
// Run (skip included) in a shared flock on lockPath for bwrap's whole duration, so this script's deletes/renames can
// Never land under a live same-cwd reader — the exclusive acquire waits for readers to drain (bounded by the same
// -w). Write-back is unaffected: persistRun flushes to `options.cwd` (the host /mnt/c path), derived independently of
// This mirror. A failed sync fails the folded script before bwrap — the os backend never falls back.
export const createWslSourceMirrorSync = (cwd: string): WslSourceMirrorSync => {
  const entryPath = getWslSourceMirrorEntryPath(cwd);
  const entryUnc = getWslSourceMirrorEntryUnc(cwd);
  const mirrorPath = getWslSourceMirrorPath(cwd);
  const lockPath = `${mirrorPath}.lock`;
  const excludes = resolveMirrorExcludes(cwd);
  const manifest = buildSourceMirrorManifest(cwd, excludes);
  reapStaleSourceMirrorTemps(entryUnc);
  // A manifest is only trusted while the tree it describes exists: a mirror whose tree was removed out-of-band but
  // Whose manifest survived would otherwise diff to an empty/near-empty delta against a gone tree — force the full
  // Materialize instead, which rebuilds tree and manifest together.
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
    const copyPaths = delta === undefined ? Object.keys(manifest).toSorted() : delta.copyPaths;
    const consumedPaths: string[] = [];
    let archivePath = "";
    if (copyPaths.length > 0) {
      const { archiveFilename, unreadablePaths } = createSourceMirrorArchive(cwd, entryUnc, copyPaths, tag);
      archivePath = `${entryPath}/${archiveFilename}`;
      consumedPaths.push(archivePath);
      // A Windows-locked copy path is missing from the archive, so it must not be published as held: pruning keeps
      // The manifest honest and later runs retry it until readable, instead of one locked file hard-failing the run.
      for (const unreadablePath of unreadablePaths) delete manifest[unreadablePath];
    }
    writeFileSync(join(entryUnc, manifestTempFilename), JSON.stringify(manifest));
    // The origin marker is staged host-side like the manifest and published via `mv` (atomic same-fs rename), so a
    // Concurrent reaper reads either the old or the complete new marker, never a half-written path it would misjudge
    // As a dead source — and the temp carries the *host* pid reapStaleSourceMirrorTemps can actually attribute (a
    // Linux-side `$$` temp would sit in the wrong pid domain forever).
    writeFileSync(join(entryUnc, originTempFilename), cwd);
    const publish = `mv ${shellQuote(`${entryPath}/${originTempFilename}`)} ${shellQuote(`${entryPath}/${VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME}`)} && mv ${shellQuote(`${entryPath}/${manifestTempFilename}`)} ${shellQuote(`${entryPath}/${VIRRUN_SOURCE_MIRROR_MANIFEST_FILENAME}`)}`;
    const withMirrorLock = (sync: string): string =>
      `mkdir -p ${shellQuote(mirrorPath)} && { flock -w ${SOURCE_MIRROR_TIMEOUT_SECONDS} 9 && ${sync} && ${publish}; } 9> ${shellQuote(lockPath)}`;
    const extract =
      archivePath === ""
        ? []
        : [
            // `--warning=no-unknown-keyword` quiets GNU tar's per-symlink "Ignoring unknown extended header keyword
            // 'LIBARCHIVE.symlinktype'" line: a benign pax header the win32 bsdtar writer stamps on every archived
            // Symlink to record its file-vs-dir target kind. That distinction is meaningless on Linux — extraction
            // Recreates the symlink correctly and exits 0 with or without it — so it is pure noise at this boundary.
            // This command only ever runs under WSL GNU tar (the mirror is win32-only; a native-Linux run uses the os
            // Backend, not this archive), and the archive itself stays standard pax for any other reader.
            `timeout ${SOURCE_MIRROR_TIMEOUT_SECONDS} tar --warning=no-unknown-keyword -xf ${shellQuote(archivePath)} -C ${shellQuote(mirrorPath)}`,
            `chmod -R 777 ${shellQuote(mirrorPath)}`,
          ];
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
    // ReapStaleSourceMirrorTemps to reclaim once this process is dead.
    const cleanup =
      consumedPaths.length === 0 ? "" : ` && rm -f ${consumedPaths.map((path) => shellQuote(path)).join(" ")}`;
    return `${withMirrorLock(sync.join(" && "))}${cleanup}`;
  }).match(
    (script) => ({ lockPath, mirrorPath, script }),
    (error) => {
      throw new InvalidOperationError(Operation.Create, createWslSourceMirrorSync.name, toAppError(error).message);
    },
  );
};
