import type { SourceMirrorArchive } from "@/models/exec/wsl/SourceMirrorArchive";

import { SOURCE_MIRROR_ARCHIVE_TIMEOUT_MS } from "@/services/exec/util/constants";
import { execFileHidden } from "@/services/exec/util/execFileHidden";
import { getTarExecutable } from "@/services/exec/util/getTarExecutable";
import {
  VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
} from "@/services/exec/wsl/constants";
import { getIsTolerableArchiveFailure } from "@/services/exec/wsl/getIsTolerableArchiveFailure";
import { joinNullDelimited } from "@/services/exec/wsl/joinNullDelimited";
import { readSourceMirrorArchiveMembers } from "@/services/exec/wsl/readSourceMirrorArchiveMembers";
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
// The copy list is consumed and unlinked here whatever tar's verdict, staged under the pid-tag convention so a plan
// That dies mid-way leaves only reapable corpses (reapStaleSourceMirrorTemps). A failure tar recovered from
// Per-entry — a Windows-locked file,
// Or one that vanished between the manifest walk and this spawn — leaves an archive complete but for those entries, so
// The listed paths its members lack come back as unarchivedPaths for the planner to prune, instead of a single skipped
// File hard-failing every run. Attribution reads the archive, never the stderr, because bsdtar names no path at all on
// A vanished entry (`tar: : Couldn't visit directory`) — the archive is the one record of what was actually captured,
// And it answers both skip kinds with the same question. Any other failure (getIsTolerableArchiveFailure), or an
// Archive that won't even list, throws and aborts the plan.
export const createSourceMirrorArchive = (
  cwd: string,
  entryUnc: string,
  copyPaths: readonly string[],
  tag: string,
): SourceMirrorArchive => {
  const archiveFilename = `${VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX}${tag}`;
  const archiveUnc = join(entryUnc, archiveFilename);
  const copyListFilename = `${VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX}${tag}`;
  const copyListUnc = join(entryUnc, copyListFilename);
  writeFileSync(copyListUnc, joinNullDelimited(copyPaths));
  const archiveResult = getResult(() =>
    execFileHidden(
      getTarExecutable(),
      ["-c", "--no-recursion", "--null", "-f", archiveUnc, "-C", cwd, "-T", copyListUnc],
      {
        timeout: SOURCE_MIRROR_ARCHIVE_TIMEOUT_MS,
      },
    ),
  );
  // The list is tar's input and nothing else's, so it is spent the moment tar returns either way — unlinking
  // Before the verdict is read keeps the aborting path from leaving the reaper a corpse it never needed
  unlinkSync(copyListUnc);
  const unarchivedPaths = archiveResult.match(
    (): string[] => [],
    (error) => {
      const stderr =
        error instanceof Error && "stderr" in error && typeof error.stderr === "string" ? error.stderr : "";
      if (!getIsTolerableArchiveFailure(stderr)) throw error;
      const members = getResult(() => readSourceMirrorArchiveMembers(archiveUnc)).match(
        (value) => new Set(value),
        () => {
          throw error;
        },
      );
      return copyPaths.filter((path) => !members.has(path));
    },
  );
  return { archiveFilename, unarchivedPaths };
};
