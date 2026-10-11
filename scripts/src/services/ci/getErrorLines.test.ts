import { MAX_ERROR_LINES_PER_JOB } from "#src/services/ci/constants";
import { getErrorLines } from "#src/services/ci/getErrorLines";
import { describe, expect, test } from "vitest";

describe(getErrorLines, () => {
  test("keeps the lines that say what failed, without the log's job, step and timestamp", () => {
    expect.hasAssertions();

    const timestamp = Temporal.Instant.fromEpochMilliseconds(0).toString();
    const prefix = `Lint\tRun lint\t${timestamp}`;
    const log = [
      `${prefix} packages/follow-ups lint: Done`,
      `${prefix}   144:7  error  Expected order  perfectionist/sort-objects`,
      `${prefix} ##[error]Process completed with exit code 1.`,
    ].join("\n");

    expect(getErrorLines(log)).toStrictEqual([
      "  144:7  error  Expected order  perfectionist/sort-objects",
      "##[error]Process completed with exit code 1.",
    ]);
  });

  test("reads a job's whole log, whose lines carry the timestamp alone", () => {
    expect.hasAssertions();

    const timestamp = Temporal.Instant.fromEpochMilliseconds(0).toString();
    const log = [`${timestamp} ✔ Build complete`, `${timestamp} fatal runtime error: stack overflow, aborting`].join(
      "\n",
    );

    expect(getErrorLines(log)).toStrictEqual(["fatal runtime error: stack overflow, aborting"]);
  });

  test("says how many lines it left out past its cap", () => {
    expect.hasAssertions();

    const timestamp = Temporal.Instant.fromEpochMilliseconds(0).toString();
    const log = Array.from({ length: MAX_ERROR_LINES_PER_JOB + 2 }, () => `${timestamp} error`).join("\n");

    expect(getErrorLines(log).at(-1)).toBe("… 2 more, in the job's log");
  });
});
