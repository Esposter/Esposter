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
});
