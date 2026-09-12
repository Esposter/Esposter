import {
  FIELD_SEPARATOR,
  getAnsweredCommits,
  RECORD_SEPARATOR,
} from "#src/services/coderabbit/collect/getAnsweredCommits";
import { describe, expect, test } from "vitest";

describe(getAnsweredCommits, () => {
  const sha = "a".repeat(40);
  const getRecord = (fields: string[]) => `${fields.join(FIELD_SEPARATOR)}${RECORD_SEPARATOR}`;

  test("reads every trailer value as a finding id and keeps the subject", () => {
    expect.hasAssertions();

    expect(getAnsweredCommits(getRecord([sha, "fix(web): guard the empty map", "12,34", "56"]))).toStrictEqual([
      { answers: [12, 34], drains: [56], sha, subject: "fix(web): guard the empty map" },
    ]);
  });

  test("drops a commit carrying neither trailer", () => {
    expect.hasAssertions();

    expect(getAnsweredCommits(getRecord([sha, "feat(web): a unit", "", ""]))).toStrictEqual([]);
  });

  test("ignores a value that is not a positive integer", () => {
    expect.hasAssertions();

    expect(getAnsweredCommits(getRecord([sha, "fix", "12, abc, -1, 0", ""]))).toStrictEqual([
      { answers: [12], drains: [], sha, subject: "fix" },
    ]);
  });
});
