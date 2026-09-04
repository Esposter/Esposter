import { writeVirrunDebug } from "#src/services/cli/debug/writeVirrunDebug";
import { checkIsProcessAlive } from "#src/services/exec/util/checkIsProcessAlive";
import { parseTempOwnerPid } from "#src/services/exec/util/parseTempOwnerPid";
import {
  VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX,
} from "#src/services/exec/wsl/constants";
import { getResult, noop } from "@esposter/shared";
import { readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
// The file-shaped twin of reapStaleTemps: the planner stages pid-tagged temp FILES (next manifest + archive +
// Copy/delete lists) into the mirror entry dir, and the plan/script removes them on success — but a hard-killed run
// Strands them, and sweepStaleEntries only reclaims directories. Unlink any temp whose owner pid is dead; a live
// Owner's staging (a concurrent run mid-plan) and the published bare names (manifest.json, origin, tree) carry no
// Matching pid tag and are always kept. Best-effort per entry — hygiene must never abort the run.
const TEMP_PREFIXES = [
  VIRRUN_SOURCE_MIRROR_MANIFEST_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_ORIGIN_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_ARCHIVE_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_COPY_TEMP_PREFIX,
  VIRRUN_SOURCE_MIRROR_DELETE_TEMP_PREFIX,
];

export const reapStaleSourceMirrorTemps = (entryUnc: string): void => {
  getResult(() => {
    for (const entry of readdirSync(entryUnc, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const pid = parseTempOwnerPid(entry.name, TEMP_PREFIXES);
      if (pid === undefined || checkIsProcessAlive(pid)) continue;
      getResult(() => {
        unlinkSync(join(entryUnc, entry.name));
      }).match(noop, ({ message }) => {
        writeVirrunDebug(`stranded mirror temp ${entry.name} not reaped — ${message}`);
      });
    }
  }).match(noop, ({ message }) => {
    writeVirrunDebug(`mirror temp sweep skipped for ${entryUnc} — ${message}`);
  });
};
