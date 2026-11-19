import { jsonDateParse } from "@esposter/shared";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

// Where each test file that made a router call leaves its record. Under `.vitest`, which the sharded runs already keep
// Out of git, and which the run clears before its first file starts
export const wakeRecordDirectory = join(process.cwd(), ".vitest", "wake-check");

interface WakeRecord {
  called: string[];
  counts: { changed: number; reruns: number; writes: number };
  file: string;
  watched: string[];
}

// The run covers every file when it names no file and no shard: only then does a procedure no suite calls fail the run,
// Since a filtered or sharded run sees only some of the suites that call the app's procedures
const isFullRun = (args: string[]) =>
  args.every((arg) => arg === "run" || arg.startsWith("-")) && !args.some((arg) => arg.startsWith("--shard"));

const readRecords = (): WakeRecord[] =>
  existsSync(wakeRecordDirectory)
    ? readdirSync(wakeRecordDirectory).map((name) =>
        jsonDateParse<WakeRecord>(readFileSync(join(wakeRecordDirectory, name), "utf8")),
      )
    : [];

// Runs once for the whole run: clears the records of an earlier run, then, after every file, reports what the wake check
// Saw, and fails the run when a watched procedure no suite calls and the run is a full one
export default function setup() {
  rmSync(wakeRecordDirectory, { force: true, recursive: true });
  return () => {
    const records = readRecords();
    const called = new Set(records.flatMap((record) => record.called));
    const counts = records.reduce(
      (total, { counts: fileCounts }) => ({
        changed: total.changed + fileCounts.changed,
        reruns: total.reruns + fileCounts.reruns,
        writes: total.writes + fileCounts.writes,
      }),
      { changed: 0, reruns: 0, writes: 0 },
    );
    const watched = records[0]?.watched ?? [];
    const uncalled = watched.filter((path) => !called.has(path)).toSorted();
    console.log(
      `live topic wake check: ${records.length} files, ${counts.writes} writes, ${counts.reruns} reads rerun, ${counts.changed} answers changed; ${watched.length - uncalled.length} of ${watched.length} watched procedures called`,
    );
    if (uncalled.length > 0) {
      const message = `watched procedures no suite calls: ${uncalled.join(", ")}`;
      // oxlint-disable-next-line no-restricted-properties -- Vitest starts a global setup with the arguments of the run, and whether the run is whole is read from them
      const args = process.argv.slice(2);
      if (isFullRun(args))
        // oxlint-disable-next-line error-handling/no-bare-error -- the run's failure names the procedures no suite calls, which no operation or entity describes
        throw new Error(message);
      console.warn(message);
    }
  };
}
