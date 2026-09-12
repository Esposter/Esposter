import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { checkIsOwnerAlive } from "#src/services/exec/util/checkIsOwnerAlive";
import { parseTempOwnerPid } from "#src/services/exec/util/parseTempOwnerPid";
import { getResult, noop } from "@esposter/shared";
import { readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
// The file-shaped twin of reapStaleTemps: a run stages pid-tagged temp FILES (`<prefix><pid>.<rest>`) that it removes
// Itself on success, and a hard-killed run strands them — but sweepStaleEntries only reclaims directories. Unlink any
// Temp whose owner pid is dead; a live owner's staging (a concurrent run mid-plan), a directory, and every bare name
// That carries no matching pid tag are always kept. Best-effort per entry — hygiene must never abort the run.
//
// `minimumAgeMs` keeps a just-stranded temp for a caller whose reader opens the file asynchronously after the owner
// Has already gone: a temp younger than the floor is left for a later sweep, and one whose mtime cannot be read is
// Too. Omitted, owner death alone decides.
export const reapStaleTempFiles = (directory: string, prefixes: readonly string[], minimumAgeMs?: number): void => {
  getResult(() => {
    const reapableBeforeMs = minimumAgeMs === undefined ? undefined : Date.now() - minimumAgeMs;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const path = join(directory, entry.name);
      const pid = parseTempOwnerPid(entry.name, prefixes);
      if (pid === undefined || checkIsOwnerAlive(pid, path)) continue;
      if (reapableBeforeMs !== undefined) {
        const mtimeMs = getResult(() => statSync(path).mtimeMs).unwrapOr(undefined);
        if (mtimeMs === undefined || mtimeMs > reapableBeforeMs) continue;
      }
      getResult(() => {
        rmSync(path, { force: true });
      }).match(noop, ({ message }) => {
        writeVirrunDebug(`stranded temp ${entry.name} not reaped — ${message}`);
      });
    }
  }).match(noop, ({ message }) => {
    writeVirrunDebug(`stranded temp sweep skipped for ${directory} — ${message}`);
  });
};
