import type { SourceMirrorManifest } from "#src/models/exec/wsl/SourceMirrorManifest";

import { SourceMirrorEntryType } from "#src/models/exec/wsl/SourceMirrorEntryType";
import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { checkIsExcludedPath } from "#src/services/exec/util/checkIsExcludedPath";
import { getResult, noop } from "@esposter/shared";
import { lstatSync, readdirSync, readlinkSync } from "node:fs";
import { join } from "node:path";
// Walk the host working tree on the native filesystem and record every mirrored entry's change signature, keyed by
// Posix relative path. This is the stat-walk an rsync quick-check would do, moved off v9fs onto the host FS where it
// Is orders of magnitude cheaper — diffing two of these manifests replaces the whole-tree remote walk, and the
// Manifest's key set is the single source of truth for what the sync's archive carries (createSourceMirrorArchive).
//
// Exclude semantics live in checkIsExcludedPath, shared with the write-back mask so the set that never enters the sandbox
// Is exactly the set that may never leave it; an excluded directory is matched and then not descended.
//
// An entry the host can't lstat/readlink (e.g. Windows-locked) is skipped, exactly as it would be unreadable for the
// Archiving tar: it drops out of the manifest, so once readable again it diffs as changed and self-heals.
export const buildSourceMirrorManifest = (cwd: string, excludes: readonly string[]): SourceMirrorManifest => {
  const manifest: SourceMirrorManifest = {};
  const walk = (directory: string, relativeBase: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
      if (checkIsExcludedPath(relativePath, excludes)) continue;
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        // The archive preserves symlinks (createSourceMirrorArchive), so the change signal is the link's OWN lstat
        // Plus its target path — a retarget flips `target`, and the target's content changing flips that target's own
        // Manifest entry (walked separately), never this one. lstat/readlink both succeed on a broken link too, so it
        // Mirrors as-is (rsync parity) instead of dropping out; a link the host can't read at all still drops.
        const stats = getResult(() => lstatSync(path)).unwrapOr(undefined);
        const target = getResult(() => readlinkSync(path)).unwrapOr(undefined);
        if (stats !== undefined && target !== undefined)
          manifest[relativePath] = {
            mtimeMs: stats.mtimeMs,
            size: stats.size,
            target,
            type: SourceMirrorEntryType.Symlink,
          };
      } else if (entry.isDirectory()) {
        manifest[relativePath] = { mtimeMs: 0, size: 0, target: "", type: SourceMirrorEntryType.Directory };
        // A whole subtree, not one entry: everything under an unreadable directory leaves the manifest at once,
        // Which the diff then reads as a deletion of every path beneath it
        getResult(() => {
          walk(path, relativePath);
        }).match(noop, ({ message }) => {
          writeVirrunDebug(`source mirror walk skipped ${relativePath} and everything under it — ${message}`);
        });
      } else if (entry.isFile()) {
        const stats = getResult(() => lstatSync(path)).unwrapOr(undefined);
        if (stats !== undefined)
          manifest[relativePath] = {
            mtimeMs: stats.mtimeMs,
            size: stats.size,
            target: "",
            type: SourceMirrorEntryType.File,
          };
      }
    }
  };
  // The root read is deliberately unguarded: an unreadable working-tree root must abort the plan — degrading to an
  // Empty manifest would diff as "delete everything" against the published manifest and wipe the mirror.
  walk(cwd, "");
  return manifest;
};
