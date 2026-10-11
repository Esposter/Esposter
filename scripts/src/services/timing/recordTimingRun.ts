import type { TimingRun } from "#src/models/timing/TimingRun";

import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { TIMING_LOG_LENGTH } from "#src/services/timing/constants";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// Appends one run to a command's log, keeps the last TIMING_LOG_LENGTH lines, and returns the milliseconds of the
// Successful runs the log held before it: the history the run is compared against. The file is replaced by a rename,
// So a run ended mid-write leaves the previous log whole rather than a truncated line. The temporary file is this
// Process's own: every worktree's commands share the log folder, and two runs ending together would rename each other's
export const recordTimingRun = (logPath: string, run: TimingRun): number[] => {
  const lines = existsSync(logPath) ? getNonEmptyLines(readFileSync(logPath, "utf8")) : [];
  const history = lines
    .map((line) => parseMachineJson<TimingRun>(line))
    .filter((previous) => previous.exitCode === 0)
    .map((previous) => previous.milliseconds);

  const boundedLines = [...lines, JSON.stringify(run)].slice(-TIMING_LOG_LENGTH);
  mkdirSync(dirname(logPath), { recursive: true });
  const temporaryPath = `${logPath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, boundedLines.map((line) => `${line}\n`).join(""));
  renameSync(temporaryPath, logPath);
  return history;
};
