import { getClaudeProjectSlug } from "#src/services/setup/getClaudeProjectSlug";
import { describe, expect, test } from "vitest";

describe(getClaudeProjectSlug, () => {
  test.each([
    ["/Users/ada/Work/.agents/checkout", "-Users-ada-Work--agents-checkout"],
    ["/Users/ada/my_repo", "-Users-ada-my-repo"],
    ["/Users/ada/my repo", "-Users-ada-my-repo"],
    ["C:\\Users\\x\\my_repo", "C--Users-x-my-repo"],
  ])("turns each character that is not a letter or a digit into a dash: %s", (path, expected) => {
    expect.hasAssertions();

    expect(getClaudeProjectSlug(path)).toBe(expected);
  });
});
