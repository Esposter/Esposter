import type { SourceMirrorArchive } from "@/models/exec/wsl/SourceMirrorArchive";

import { SOURCE_MIRROR_ARCHIVE_TIMEOUT_MS } from "@/services/exec/util/constants";
import { execFileHidden } from "@/services/exec/util/execFileHidden";
import {
  VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
} from "@/services/exec/wsl/constants";
import { joinNullDelimited } from "@/services/exec/wsl/joinNullDelimited";
import { parseUnreadableArchivePaths } from "@/services/exec/wsl/parseUnreadableArchivePaths";
import { getResult } from "@esposter/shared";
import { unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// Stage the sync's data plane: host `tar` (bsdtar on win32) reads the copied paths at native NTFS speed into one
// Archive written over the UNC — the 9p bridge carries a single sequential write instead of rsync opening each file
// Across v9fs, taking a cold materialize of a tens-of-thousands-of-files repo from minutes to seconds. `--no-recursion`
// Archives exactly the listed entries (matching the manifest's per-entry bookkeeping), `--null -T` shares the delete
// List's null-delimited form so any filename survives, `-C cwd` keys members by the manifest's posix relative paths.
// Symlinks are archived AS symlinks (no `-h`): the repo's intra-tree symlinks carry position-dependent relative
// Content (e.g. every package's `eslint.config.js` links to `../configuration/eslint/index.*.js`, whose own imports
// Resolve `../../app/.nuxt/...` from the link target's real directory), so dereferencing would copy that content into
// The link's location and break its relative resolution — the whole-repo lint failure the tar migration first shipped.
// Preserving the link restores rsync's default: the target is mirrored too, so it resolves at extract, and Node walks
// The symlink's realpath to bind imports from the right base. All flags parse identically on bsdtar and GNU tar, so
// Tests exercise the real spawn on any platform. (The win32 bsdtar writer stamps a benign pax LIBARCHIVE.symlinktype
// Header on each symlink member; the WSL GNU-tar extract quiets its "unknown keyword" warning — createWslSourceMirrorSync.)
//
// The copy list is consumed and unlinked here, staged under the pid-tag convention so a plan that dies mid-way leaves
// Only reapable corpses (reapStaleSourceMirrorTemps). A failure whose stderr is entirely "couldn't open" reports
// (Windows-locked files — tar keeps archiving the rest) returns those paths as unreadablePaths for the planner to
// Prune, instead of one locked file hard-failing every run; any other failure throws and aborts the plan.
export const createSourceMirrorArchive = (
  cwd: string,
  entryUnc: string,
  copyPaths: readonly string[],
  tag: string,
): SourceMirrorArchive => {
  const archiveFilename = `${VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX}${tag}`;
  const copyListFilename = `${VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX}${tag}`;
  const copyListUnc = join(entryUnc, copyListFilename);
  writeFileSync(copyListUnc, joinNullDelimited(copyPaths));
  const unreadablePaths = getResult(() =>
    execFileHidden(
      "tar",
      ["-c", "--no-recursion", "--null", "-f", join(entryUnc, archiveFilename), "-C", cwd, "-T", copyListUnc],
      { timeout: SOURCE_MIRROR_ARCHIVE_TIMEOUT_MS },
    ),
  ).match(
    (): string[] => [],
    (error) => {
      const stderr =
        error instanceof Error && "stderr" in error && typeof error.stderr === "string" ? error.stderr : "";
      const paths = parseUnreadableArchivePaths(stderr);
      if (paths === undefined) throw error;
      return paths;
    },
  );
  unlinkSync(copyListUnc);
  return { archiveFilename, unreadablePaths };
};
