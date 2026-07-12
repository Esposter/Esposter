import { SOURCE_MIRROR_ARCHIVE_TIMEOUT_MS } from "@/services/exec/util/constants";
import { execFileHidden } from "@/services/exec/util/execFileHidden";
import {
  VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
} from "@/services/exec/wsl/constants";
import { joinNullDelimited } from "@/services/exec/wsl/joinNullDelimited";
import { unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// Stage the sync's data plane: one tar archive of the copied paths, written by host `tar` (bsdtar on win32) straight
// Into the mirror entry over the UNC, and return its staged filename for the Linux script to extract into `tree/`.
// This is the whole reason the sync's per-file 9p cost is gone: the host reads every copied file at native NTFS speed
// And the 9p bridge carries ONE sequential archive write, instead of rsync opening each file across v9fs — a cold
// Materialize of a tens-of-thousands-of-files repo went from blowing the 5-minute timeout to seconds. `--no-recursion` archives
// Exactly the listed entries (a listed directory is its entry alone, its children are their own listed paths —
// Matching the manifest's per-entry bookkeeping), `--null -T` feeds the same null-delimited path form the delete list
// Uses so any filename survives, and `-C cwd` keys members by the manifest's posix relative paths. Both flags parse
// Identically on bsdtar and GNU tar, so tests exercise the real spawn on any platform. The copy list is consumed and
// Unlinked here — the script never sees it — but it stages under the pid-tag convention so a plan that dies mid-way
// Leaves only reapable corpses (reapStaleSourceMirrorTemps). A tar failure (unreadable/locked source file) throws and
// Aborts the plan, exactly as the unreadable file failed the rsync it replaces.
export const createSourceMirrorArchive = (
  cwd: string,
  entryUnc: string,
  copyPaths: readonly string[],
  tag: string,
): string => {
  const archiveFilename = `${VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX}${tag}`;
  const copyListFilename = `${VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX}${tag}`;
  const copyListUnc = join(entryUnc, copyListFilename);
  writeFileSync(copyListUnc, joinNullDelimited(copyPaths));
  execFileHidden(
    "tar",
    ["-c", "--no-recursion", "--null", "-f", join(entryUnc, archiveFilename), "-C", cwd, "-T", copyListUnc],
    { timeout: SOURCE_MIRROR_ARCHIVE_TIMEOUT_MS },
  );
  unlinkSync(copyListUnc);
  return archiveFilename;
};
