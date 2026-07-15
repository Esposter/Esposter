import { SOURCE_MIRROR_ARCHIVE_TIMEOUT_MS } from "@/services/exec/util/constants";
import { execFileHidden } from "@/services/exec/util/execFileHidden";
// Cap above the default 1 MB so a full materialize's member list (one line per mirrored path) never overflows the
// Exec buffer.
const ARCHIVE_MEMBERS_MAX_BUFFER = 256 * 1024 * 1024;
// List a staged archive's members as stored: posix relative paths keyed by the `-C cwd` it was built with, so they
// Compare against copy paths and manifest keys directly. A directory member's trailing slash is normalized away, and
// Lines split on \r?\n since the win32 bsdtar terminates them with \r\n. Throws like any other tar spawn — a listing
// That fails means the archive is unreadable or truncated, which is never a tolerable outcome for its caller.
export const readSourceMirrorArchiveMembers = (archiveUnc: string): string[] =>
  execFileHidden("tar", ["-tf", archiveUnc], {
    maxBuffer: ARCHIVE_MEMBERS_MAX_BUFFER,
    timeout: SOURCE_MIRROR_ARCHIVE_TIMEOUT_MS,
  })
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((member) => (member.endsWith("/") ? member.slice(0, -1) : member));
