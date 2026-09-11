import { EXEC_FILE_MAX_BUFFER, SOURCE_MIRROR_ARCHIVE_TIMEOUT_MS } from "#src/services/exec/util/constants";
import { execFileHidden } from "#src/services/exec/util/execFileHidden";
import { getTarExecutable } from "#src/services/exec/util/getTarExecutable";

const LEADING_CURRENT_DIRECTORY_REGEX = /^\.\//u;
// List a staged archive's members as stored: posix relative paths keyed by the `-C cwd` it was built with, so they
// Compare against copy paths and manifest keys directly. Every form tar is free to vary the same name by is collapsed
// To that one shape — a `./` prefix, a `\` separator, a directory's trailing `/`, a decomposed unicode filename —
// Because attribution reads a member's ABSENCE as "never archived" and prunes it from the manifest, so a name
// Mismatch would silently re-copy a captured file on every run. Lines split on \r?\n since the win32 bsdtar
// Terminates them with \r\n. Throws like any other tar spawn — a listing that fails means the archive is unreadable
// Or truncated, which is never a tolerable outcome for its caller.
export const readSourceMirrorArchiveMembers = (archiveUnc: string): string[] =>
  execFileHidden(getTarExecutable(), ["-tf", archiveUnc], {
    maxBuffer: EXEC_FILE_MAX_BUFFER,
    timeout: SOURCE_MIRROR_ARCHIVE_TIMEOUT_MS,
  })
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((member) => {
      const normalizedMember = member.replaceAll("\\", "/").replace(LEADING_CURRENT_DIRECTORY_REGEX, "").normalize();
      return normalizedMember.endsWith("/") ? normalizedMember.slice(0, -1) : normalizedMember;
    });
