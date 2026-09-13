import {
  FIELD_SEPARATOR,
  getAnsweredCommits,
  RECORD_SEPARATOR,
} from "#src/services/coderabbit/collect/getAnsweredCommits";
import { describe, expect, test } from "vitest";

const getRecord = (fields: string[]) => `${fields.join(FIELD_SEPARATOR)}${RECORD_SEPARATOR}`;

describe(getAnsweredCommits, () => {
  const sha = "a".repeat(40);

  test("reads every trailer value as a finding id and keeps the subject", () => {
    expect.hasAssertions();

    const body = "fix(web): guard the empty map\n\nAnswers: 12,34\nDrains: 56\n";

    expect(getAnsweredCommits(getRecord([sha, "fix(web): guard the empty map", body]))).toStrictEqual([
      { answers: [12, 34], drains: [56], sha, subject: "fix(web): guard the empty map" },
    ]);
  });

  test("drops a commit carrying neither trailer", () => {
    expect.hasAssertions();

    expect(getAnsweredCommits(getRecord([sha, "feat(web): a unit", "feat(web): a unit\n\nA body.\n"]))).toStrictEqual(
      [],
    );
  });

  test("ignores a value that is not a positive integer", () => {
    expect.hasAssertions();

    expect(getAnsweredCommits(getRecord([sha, "fix", "fix\n\nAnswers: 12, abc, -1, 0\n"]))).toStrictEqual([
      { answers: [12], drains: [], sha, subject: "fix" },
    ]);
  });

  // git reads trailers out of the last contiguous block alone, and every commit here ends with an attribution
  // Line — so a trailer a paragraph above it is one `%(trailers:key=…)` reports as absent, and the finding it
  // Answers is drained a second time
  test("reads a trailer separated from the attribution line by a blank line", () => {
    expect.hasAssertions();

    const body = [
      "fix(scripts): a limit is read only off a drain that never started",
      "",
      "A body paragraph.",
      "",
      "Answers: 3998827030",
      "",
      "Co-Authored-By: Someone <noreply@example.com>",
      "",
    ].join("\n");

    expect(getAnsweredCommits(getRecord([sha, "fix(scripts): a limit", body]))).toStrictEqual([
      { answers: [3998827030], drains: [], sha, subject: "fix(scripts): a limit" },
    ]);
  });

  // Several fixes in one window each name their own finding, and the commit that carries them says so once per
  // Line rather than folding them into one comma list
  test("reads a key repeated on its own line", () => {
    expect.hasAssertions();

    const body = "fix\n\nAnswers: 12\nAnswers: 34\n";

    expect(getAnsweredCommits(getRecord([sha, "fix", body]))).toStrictEqual([
      { answers: [12, 34], drains: [], sha, subject: "fix" },
    ]);
  });
});
