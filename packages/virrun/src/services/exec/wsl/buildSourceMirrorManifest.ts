import type { SourceMirrorManifest } from "@/models/exec/wsl/SourceMirrorManifest";

import { SourceMirrorEntryType } from "@/models/exec/wsl/SourceMirrorEntryType";
import { getResult, noop } from "@esposter/shared";
import { lstatSync, readdirSync, readlinkSync } from "node:fs";
import { join } from "node:path";
// Walk the host working tree on the native filesystem and record every mirrored entry's change signature, keyed by
// Posix relative path. This is the same stat-walk rsync's quick-check does, moved off v9fs onto the host FS where it
// Is orders of magnitude cheaper — diffing two of these manifests replaces the whole-tree remote walk.
//
// Excludes replicate the rsync `--exclude` semantics for the patterns resolveMirrorExcludes produces: a bare name
// (node_modules, .git) matches its basename at any depth, a slashed pattern (an environment's prepare output like
// `packages/app/.nuxt`) matches the relative path from the walk root; an excluded directory is not descended. Both
// Sides of a sync must agree on the mirrored set, so a full rsync fallback passes the same patterns.
//
// An entry the host can't lstat/readlink (e.g. Windows-locked) is skipped, exactly as it is unreadable for a /mnt/c
// Rsync today: it drops out of the manifest, so once readable again it diffs as changed and self-heals.
export const buildSourceMirrorManifest = (cwd: string, excludes: readonly string[]): SourceMirrorManifest => {
  const nameExcludes = new Set(excludes.filter((exclude) => !exclude.includes("/")));
  const pathExcludes = new Set(excludes.filter((exclude) => exclude.includes("/")));
  const manifest: SourceMirrorManifest = {};
  const walk = (directory: string, relativeBase: string): void => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const relativePath = relativeBase === "" ? entry.name : `${relativeBase}/${entry.name}`;
      if (nameExcludes.has(entry.name) || pathExcludes.has(relativePath)) continue;
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        const target = getResult(() => readlinkSync(path)).unwrapOr(undefined);
        if (target !== undefined)
          manifest[relativePath] = { mtimeMs: 0, size: 0, target, type: SourceMirrorEntryType.Symlink };
      } else if (entry.isDirectory()) {
        manifest[relativePath] = { mtimeMs: 0, size: 0, target: "", type: SourceMirrorEntryType.Directory };
        getResult(() => {
          walk(path, relativePath);
        }).match(noop, noop);
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
  walk(cwd, "");
  return manifest;
};
