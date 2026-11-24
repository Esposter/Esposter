import { checkIsFullRun, getWakeGaps, getWakeRecordDirectory, readWakeRecords } from "@esposter/shared-node/wake-check";
import { rmSync } from "node:fs";

// Runs once for the whole run: clears the records of an earlier run, then, after every file, reports what the wake
// Check saw, and fails the run when a watched procedure no suite calls and the run is a full one
export default function setup() {
  rmSync(getWakeRecordDirectory(process.cwd()), { force: true, recursive: true });
  return () => {
    const records = readWakeRecords(process.cwd());
    const counts = records.reduce(
      (total, { counts: fileCounts }) => ({
        changed: total.changed + fileCounts.changed,
        reruns: total.reruns + fileCounts.reruns,
        writes: total.writes + fileCounts.writes,
      }),
      { changed: 0, reruns: 0, writes: 0 },
    );
    const watched = records[0]?.watched ?? [];
    const uncalled = getWakeGaps(records);
    console.log(
      `live topic wake check: ${records.length} files, ${counts.writes} writes, ${counts.reruns} reads rerun, ${counts.changed} answers changed; ${watched.length - uncalled.length} of ${watched.length} watched procedures called`,
    );
    if (uncalled.length > 0) {
      const message = `watched procedures no suite calls: ${uncalled.join(", ")}`;
      /* oxlint-disable-next-line no-restricted-properties -- Vitest starts a global setup with the arguments of the
         run, and whether the run is whole is read from them */
      const args = process.argv.slice(2);
      if (checkIsFullRun(args))
        /* oxlint-disable-next-line error-handling/no-bare-error -- the run's failure names the procedures no suite
           calls, which no operation or entity describes */
        throw new Error(message);
      console.warn(message);
    }
  };
}
