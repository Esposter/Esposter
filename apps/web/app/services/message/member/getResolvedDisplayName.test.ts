import { getResolvedDisplayName } from "#src/services/message/member/getResolvedDisplayName";
import { describe, expect, test } from "vitest";

describe(getResolvedDisplayName, () => {
  const accountName = "accountName";

  test.each([
    { description: "trims a typed name", displayName: " a ", expected: "a" },
    { description: "falls back to the account name for a blank one", displayName: "  ", expected: accountName },
  ])("$description", ({ displayName, expected }) => {
    expect.hasAssertions();

    expect(getResolvedDisplayName(displayName, accountName)).toBe(expected);
  });
});
