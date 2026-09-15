import { ANSWERS_TRAILER, DRAINS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getAnsweredCommits } from "#src/services/coderabbit/collect/getAnsweredCommits";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/shared/constants";
import { describe, expect, test } from "vitest";

const getRecord = (fields: string[]) => `${fields.join(FIELD_SEPARATOR)}${RECORD_SEPARATOR}`;

describe(getAnsweredCommits, () => {
  const sha = "a".repeat(40);
  const subject = "subject";

  test("reads every trailer value as a finding id and keeps the subject", () => {
    expect.hasAssertions();

    const body = `${ANSWERS_TRAILER}: 1,2\n${DRAINS_TRAILER}: 3\n`;

    expect(getAnsweredCommits(getRecord([sha, subject, body]))).toStrictEqual([
      { answers: [1, 2], drains: [3], sha, subject },
    ]);
  });

  test("drops a commit carrying neither trailer", () => {
    expect.hasAssertions();

    expect(getAnsweredCommits(getRecord([sha, subject, ""]))).toStrictEqual([]);
  });

  test("ignores a value that is not a positive integer", () => {
    expect.hasAssertions();

    const body = `${ANSWERS_TRAILER}: 1, ${String(Number.NaN)}, -1, 0\n`;

    expect(getAnsweredCommits(getRecord([sha, subject, body]))).toStrictEqual([
      { answers: [1], drains: [], sha, subject },
    ]);
  });

  // Git reads trailers out of the last contiguous block alone, and every commit here ends with an attribution
  // Line — so a trailer a paragraph above it is one `%(trailers:key=…)` reports as absent, and the finding it
  // Answers is drained a second time
  test("reads a trailer separated from the attribution line by a blank line", () => {
    expect.hasAssertions();

    const body = [`${ANSWERS_TRAILER}: 1`, "", "Co-Authored-By:", ""].join("\n");

    expect(getAnsweredCommits(getRecord([sha, subject, body]))).toStrictEqual([
      { answers: [1], drains: [], sha, subject },
    ]);
  });

  // Several fixes in one window each name their own finding, and the commit that carries them says so once per
  // Line rather than folding them into one comma list
  test("reads a key repeated on its own line", () => {
    expect.hasAssertions();

    const body = `${ANSWERS_TRAILER}: 1\n${ANSWERS_TRAILER}: 2\n`;

    expect(getAnsweredCommits(getRecord([sha, subject, body]))).toStrictEqual([
      { answers: [1, 2], drains: [], sha, subject },
    ]);
  });
});
