import { FAILED_LOG_TAIL_LINES } from "#src/services/coderabbit/collect/constants";
import { TEST_FILENAME } from "#src/services/coderabbit/collect/constants.test";
import { getFailedLogExcerpt } from "#src/services/coderabbit/collect/getFailedLogExcerpt";
import { describe, expect, test } from "vitest";

describe(getFailedLogExcerpt, () => {
  const timestamp = new Date(0).toISOString();
  const getLine = (job: string, text: string) => `${job}\t${TEST_FILENAME}\t${timestamp} ${text}`;

  test("keeps the tail of every failing job, one section per job, without the terminal colours", () => {
    expect.hasAssertions();

    const lines = Array.from({ length: FAILED_LOG_TAIL_LINES + 1 }, (_value, index) => getLine("a", index.toString()));
    const log = [...lines, getLine("b", "\u001B[31m×\u001B[0m")].join("\n");
    // The tail is every line but the first, which the cap pushed out
    const tail = Array.from({ length: FAILED_LOG_TAIL_LINES }, (_value, index) => (index + 1).toString()).join("\n");

    expect(getFailedLogExcerpt(log)).toBe(`### a\n\n${tail}\n\n### b\n\n×`);
  });

  test("reads nothing off a line that is not the runner's", () => {
    expect.hasAssertions();

    expect(getFailedLogExcerpt(TEST_FILENAME)).toBe("");
  });
});
