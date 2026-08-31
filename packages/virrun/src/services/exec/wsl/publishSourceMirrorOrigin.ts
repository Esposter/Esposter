import {
  VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME,
  VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX,
} from "#src/services/exec/wsl/constants";
import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { getResult, noop } from "@esposter/shared";
import { renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
// Records the host cwd an entry was mirrored from, the marker reapAbandonedSourceMirrors attributes it by.
// Staged-then-renamed because a torn marker is worse than none: a reaper reading a truncated path would judge the
// Repo deleted and reap a LIVE mirror, while rename is atomic on the ext4 the entry sits on.
// Best-effort: the marker is bookkeeping for a GC sweep, and this rename crosses the 9p redirector where a
// Concurrent reaper's `readFileSync` holds the destination open — on win32 a rename over an open handle fails
// Outright, and two same-repo runs under one `pnpm -r --parallel` are enough to hit it. Aborting there would fail
// The user's command for a marker nothing in this run reads. What makes swallowing it safe is that every planning
// Pass republishes a missing marker, so a failure costs one window rather than leaving the entry unattributable.
export const publishSourceMirrorOrigin = (entryUnc: string, cwd: string): void => {
  const originTempPath = join(
    entryUnc,
    `${VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX}${process.pid}.${crypto.randomUUID()}`,
  );
  getResult(() => {
    writeFileSync(originTempPath, cwd);
    renameSync(originTempPath, join(entryUnc, VIRRUN_SOURCE_MIRROR_ORIGIN_FILENAME));
  }).match(noop, ({ message }) => {
    writeVirrunDebug(`source mirror origin marker not published for ${entryUnc} — ${message}`);
  });
};
