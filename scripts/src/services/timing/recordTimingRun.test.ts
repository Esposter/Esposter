import type { TimingRun } from "#src/models/timing/TimingRun";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { TIMING_LOG_LENGTH } from "#src/services/timing/constants";
import { recordTimingRun } from "#src/services/timing/recordTimingRun";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

describe(recordTimingRun, () => {
  const COMMAND = "claim";
  const EMPTY_ARGS = { flags: [], positionals: 0 };
  const createRun = (milliseconds: number, exitCode: number): TimingRun => ({
    args: EMPTY_ARGS,
    command: COMMAND,
    date: new Date(0).toISOString(),
    exitCode,
    milliseconds,
  });
  let directory = "";
  let logPath = "";

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "timing-"));
    logPath = join(directory, `${COMMAND}.jsonl`);
  });
  afterEach(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  test("keeps only the last TIMING_LOG_LENGTH runs", () => {
    expect.hasAssertions();

    for (let milliseconds = 1; milliseconds <= TIMING_LOG_LENGTH + 1; milliseconds++)
      recordTimingRun(logPath, createRun(milliseconds, 0));

    const logged = readFileSync(logPath, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => parseMachineJson<TimingRun>(line).milliseconds);
    expect(logged).toStrictEqual(Array.from({ length: TIMING_LOG_LENGTH }, (_, index) => index + 2));
  });

  test("returns the milliseconds of the successful runs before the new one, not the failed ones", () => {
    expect.hasAssertions();

    recordTimingRun(logPath, createRun(100, 0));
    recordTimingRun(logPath, createRun(200, 1));

    expect(recordTimingRun(logPath, createRun(300, 0))).toStrictEqual([100]);
  });
});
